from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User  # Agar aapki file kisi aur naam se hai toh correct kar lein

@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    # 1. Admin list view mein kaun kaun se columns dikhenge
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'is_active', 'date_joined')
    
    # 2. Kin fields par click karke details page khulega
    list_display_links = ('email',)
    
    # 3. List view mein right side par filter lagane ke liye
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')
    
    # 4. Search bar kis basis par kaam karega
    search_fields = ('email', 'first_name', 'last_name')
    
    # 5. Default ordering (Naye users upar aayenge)
    ordering = ('-date_joined',)

    # 6. Crucial Fix: Custom Fieldsets (Kyunki default fieldsets username dhoondte hain)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    # 7. Naya user admin panel se add karte waqt kaun si fields samne aayengi
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password', 'first_name', 'last_name', 'is_active', 'is_staff'),
        }),
    )

    # 8. List view mein hi active status toggle karne ke liye (Optional but handy)
    list_editable = ('is_active', 'is_staff')