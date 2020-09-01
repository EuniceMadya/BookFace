""" This is the operations admin can do for this website """
from django.contrib import admin
from .models import *
# admin account for development use
# email: admin1@gmail.com
# username: admin
# password: 123456789

# Register your models here.
admin.site.register(User)
admin.site.register(Tag)
admin.site.register(BookClub)
admin.site.register(Poll)
admin.site.register(Choice)
admin.site.register(Vote)
# admin.site.register(Book)
admin.site.register(Meeting)
admin.site.register(Attendance)
admin.site.register(Discussion)
admin.site.register(Thread)
admin.site.register(Administrator)
