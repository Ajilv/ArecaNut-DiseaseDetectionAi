from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractUser


# Create your models here.
class CustomUser(AbstractUser):
    email=models.EmailField(unique=True)
    bio=models.TextField(blank=True,null=True)
    is_verified=models.BooleanField(default=False)

    USERNAME_FIELD = "username"

    def __str__(self):
        return self.email

User=get_user_model()

class Profile(models.Model):
    user=models.OneToOneField(User,on_delete=models.CASCADE)
    profile_picture=models.ImageField(upload_to='profile_pics/',blank=True,null=True)
    website=models.URLField(blank=True,null=True)
    location=models.CharField(max_length=100,blank=True,null=True)
    birth_date=models.DateField(blank=True,null=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"


class Analysis(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to='analyses/')
    symptoms = models.TextField(blank=True, null=True)
    additional_info = models.TextField(blank=True, null=True)
    result = models.TextField(blank=True, null=True)
    recommendations = models.TextField(blank=True, null=True)
    remedies = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Analysis {self.id} for {self.user.username}"

