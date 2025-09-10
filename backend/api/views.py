from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from groq import Groq
from django.conf import settings
from services.api import analysis_api 
from .serializers import RegisterSerializer, ProfileSerializer, AnalysisSerializer
from .models import Analysis


# -------------------------------
# Authentication Views
# -------------------------------

class RegisterUser(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "User logged out successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)


class ProfileView(APIView):
    def get(self, request):
        user = request.user
        profile = getattr(user, "profile", None)  # safely get profile

        if not profile:
            return Response(
                {"error": "Profile does not exist. Please create one."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        user = request.user
        profile = getattr(user, "profile", None)

        if not profile:
            return Response(
                {"error": "Profile does not exist. Please create one."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request):
        user = request.user

        # Check if profile already exists → don’t create duplicate
        if hasattr(user, "profile"):
            return Response(
                {"error": "Profile already exists. Use PUT to update."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = ProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# -------------------------------
# Analysis Views
# -------------------------------
groq_client = Groq(api_key=settings.GROQ_API_KEY)

class AnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Return analysis history for the user"""
        analyses = request.user.analysis_set.all().order_by("-created_at")
        serializer = AnalysisSerializer(analyses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Upload image for analysis and generate result, recommendations, and remedies"""
        serializer = AnalysisSerializer(data=request.data)
        if serializer.is_valid():
            # Save initial analysis with user, file, symptoms, additional_info
            analysis = serializer.save(user=request.user)

            # Run your ML/analysis model on the uploaded image
            uploaded_file = analysis.file.path if analysis.file else None
            analysis.result = self.run_analysis(uploaded_file)

            # Generate AI recommendations and remedies based on result
            symptoms = analysis.symptoms or ''
            additional_info = analysis.additional_info or ''
            analysis.recommendations = self.get_ai_recommendations(analysis.result, symptoms, additional_info)
            analysis.remedies = self.get_ai_remedies(analysis.result, symptoms, additional_info)

            analysis.save()

            return Response(AnalysisSerializer(analysis).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def run_analysis(self, file_path):
        """
        Process the uploaded image using the arecanut_cnn_model.keras via AnalysisAPI.
        """
        if not file_path:
            return "No file uploaded"

        try:
            # Delegate the analysis to the AnalysisAPI instance
            result = analysis_api.run_analysis(file_path)
            return result
        except Exception as e:
            return f"Error processing image: {str(e)}"

    def get_ai_recommendations(self, result, symptoms='', additional_info=''):
        """
        Generate recommendations using Groq AI.
        """
        prompt = f"""
            You are a knowledgeable plant pathologist specializing in Areca nut trees. 
            Based on the following disease analysis result, provide 3–5 clear, practical recommendations for farmers. 
            Emphasize evidence-based plant care options. 
            Always start with a disclaimer that this is not a substitute for professional agricultural advice and that farmers should consult a qualified agricultural expert or extension officer for confirmation. 
            Do not provide unrelated human medical advice.

            Disease Analysis Result: {result}
            Observed Symptoms: {symptoms}
            Additional Information: {additional_info}

            Structure your response as a numbered list of recommendations. 
            End with a note on when farmers should seek immediate help from an agricultural expert 
            (e.g., rapid disease spread, severe wilting, or widespread leaf damage).
            """
        try:
            response = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",  # Groq's Mixtral model; adjust as needed
                messages=[
                    {"role": "system", "content": "You are a plant health expert, specializing in diseases affecting areca nut trees."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,
                temperature=0.7,
            )
            recommendations_text = response.choices[0].message.content.strip()
            return recommendations_text
        except Exception as e:
            print(f"Groq API error for recommendations: {e}")
            return "Error generating recommendations. Please try again later."

    def get_ai_remedies(self, result, symptoms='', additional_info=''):
        """
        Generate remedies using Groq AI.
        """
        prompt = f"""
            You are a knowledgeable agricultural advisor specializing in Areca nut trees. 
            Based on the following disease analysis result, provide 3–5 clear potential remedies, 
            including natural, organic, or farmer-friendly options where appropriate. 
            Emphasize evidence-based agricultural practices. 
            Always start with a disclaimer that this is not a substitute for professional agricultural advice 
            and farmers should consult a qualified agricultural expert or local extension officer for confirmation. 
            Do not provide unrelated human medical advice.

            Disease Analysis Result: {result}
            Observed Symptoms: {symptoms}
            Additional Information: {additional_info}

            Structure your response as a numbered list of remedies. 
            End with a note on when farmers should seek immediate assistance from an agricultural expert 
            (e.g., if disease spreads rapidly, trees show severe wilting, or large portions of the plantation are affected).
            """

        try:
            response = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",  # Groq's Mixtral model; adjust as needed
                messages=[
                    {"role": "system", "content": "You are a plant health expert, specializing in diseases affecting areca nut trees."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,
                temperature=0.7,
            )
            remedies_text = response.choices[0].message.content.strip()
            return remedies_text
        except Exception as e:
            print(f"Groq API error for remedies: {e}")
            return "Error generating remedies. Please try again later."

class AnalysisDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        analysis = get_object_or_404(Analysis, pk=pk, user=request.user)
        serializer = AnalysisSerializer(analysis)
        return Response(serializer.data, status=status.HTTP_200_OK)