# backend/services/api.py
import tensorflow as tf
import os
from django.conf import settings
from PIL import Image
import numpy as np

class AnalysisAPI:
    def __init__(self):
        model_path = os.path.join(settings.BASE_DIR, 'models', 'arecanut_cnn_model.keras')
        self.model = tf.keras.models.load_model(model_path)
        print("Model Input Shape:", self.model.input_shape)  # Debug print
        # Define the list of disease classes (replace with actual class names from training)
        self.disease_classes = ['Healthy Leaf',
                    'Healthy Nut',
                    'Healthy Trunk',
                    'Mahali_Koleroga',
                    'Stem Bleeding',
                    'Budborer',
                    'Healthy Foot',
                    'Stem Cracking',
                    'Yellow Leaf Disease']  # Must have 9 entries to match the output shape (1, 9)

    def run_analysis(self, file_path):
        if not file_path:
            return "No file uploaded"
        try:
            img = Image.open(file_path).convert('RGB')
            # Adjust resize to match the model's expected input shape
            img = img.resize((128, 128))  # Adjust based on model.input_shape; refine after checking
            img_array = np.array(img) / 255.0
            img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
            prediction = self.model.predict(img_array)
            print("Prediction:", prediction)  # Debug print to verify output
            # Get the index of the class with the highest probability
            predicted_class_index = np.argmax(prediction[0])
            # Map to disease name, with fallback if index is invalid
            if 0 <= predicted_class_index < len(self.disease_classes):
                disease_name = self.disease_classes[predicted_class_index]
            else:
                disease_name = "Unknown Disease"
            return f"It seems the Aerca Nut is {disease_name}."
        except Exception as e:
            return f"Error processing image: {str(e)}"

analysis_api = AnalysisAPI()