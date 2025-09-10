from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterUser, LogoutView, ProfileView, AnalysisView, AnalysisDetailView

urlpatterns = [
    path("auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/register/", RegisterUser.as_view(), name="register"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/profile/", ProfileView.as_view(), name="profile"),

    path("analysis/analyze/", AnalysisView.as_view(), name="analyze"),
    path("analysis/history/", AnalysisView.as_view(), name="analysis_history"),
    path("analysis/analyze/<int:pk>/", AnalysisDetailView.as_view(), name="analysis_detail"),
]
