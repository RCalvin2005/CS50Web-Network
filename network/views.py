import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect
from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.core.paginator import Paginator

from .models import User, Post


def index(request):
    """ Displays all posts """

    # https://docs.djangoproject.com/en/4.2/topics/pagination/

    posts = Post.objects.all().order_by("-timestamp")
    paginator = Paginator(posts, 10)

    page_num= request.GET.get('page')
    page_obj = paginator.get_page(page_num)

    return render(request, "network/index.html", {
        "heading": "All Posts",
        "page_obj": page_obj
    })


@login_required
def following(request):
    """ Displays posts from users that the request user is following """

    # https://stackoverflow.com/questions/4016794/how-to-filter-a-django-queryset-using-an-array-on-a-field-like-sqls-in

    posts = Post.objects.filter(user__in=request.user.following.all()).order_by("-timestamp")
    paginator = Paginator(posts, 10)

    page_num= request.GET.get('page')
    page_obj = paginator.get_page(page_num)

    return render(request, "network/index.html", {
        "heading": "Following",
        "page_obj": page_obj
    })


def profile(request, username):
    """ Displays profile page of given user and update follow status """

    if request.method == "GET":
        # https://stackoverflow.com/questions/11743207/how-to-query-case-insensitive-data-in-django-orm
        try:
            profile_user = User.objects.get(username__iexact=username)
        except User.DoesNotExist:
            return render(request, "network/error.html", {
                "message": f"The user {username} does not exist"
            })

        posts = Post.objects.filter(user=profile_user).order_by("-timestamp")
        paginator = Paginator(posts, 10)

        page_num= request.GET.get('page')
        page_obj = paginator.get_page(page_num)

        return render(request, "network/profile.html", {
            "profile_user": profile_user,
            "page_obj": page_obj,
            "followers": profile_user.followers.count(),
            "following": profile_user.following.count(),
            "is_following": request.user in profile_user.followers.all(),
        })
    
    # Update follow status
    elif request.method == "PUT":
        if not request.user.is_authenticated:
            return JsonResponse({"error": f"Login in to follow other users"}, status=400)

        try:
            profile_user = User.objects.get(username__iexact=username)
        except User.DoesNotExist:
            return JsonResponse({"error": f"The user {username} does not exist"}, status=404)

        # Reject if trying to follow own account
        if request.user == profile_user:
            return JsonResponse({"error": f"Cannot follow user's own account"}, status=400)

        data = json.loads(request.body)
        if data.get("set_to_following") is not None:
            if data.get("set_to_following"):
                profile_user.followers.add(request.user)
            else:
                profile_user.followers.remove(request.user)
        return HttpResponse(status=204)

    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)


@login_required
def new_post(request):
    """ Allows user to create new post """

    if request.method == "POST":

        content = request.POST["content"]
        if not content:
            return render(request, "network/new_post.html", {
                "message": "Post content cannot be empty."
            })

        post = Post(
            user = request.user,
            content = content,
        )
        post.save()

        return HttpResponseRedirect(reverse("index"))

    else:
        return render(request, "network/new_post.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure username and password is not empty
        if not username:
            return render(request, "network/register.html", {
                "message": "Missing username."
            })
        if not email:
            return render(request, "network/register.html", {
                "message": "Missing email."
            })

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
