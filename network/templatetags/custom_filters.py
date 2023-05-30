from django import template

from network.models import Post

register = template.Library()


@register.simple_tag
def liked(user, post):
    """ Returns True/False if user is watching a listing """
    return user in post.likes.all()