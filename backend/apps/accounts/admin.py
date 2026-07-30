from django.contrib import admin
from .models import User, Invitation, PasswordResetToken

admin.site.register(User)
admin.site.register(Invitation)
admin.site.register(PasswordResetToken)