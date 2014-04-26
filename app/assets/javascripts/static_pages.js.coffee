# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/

# smooth scrolling for scroll to top
$('.scroll-top').click(
  ->
    $('body,html').animate({scrollTop:0},800);
)

# smooth scrolling for scroll down
$('.scroll-down').click(
  ->
    $('body,html').animate({scrollTop:$(window).scrollTop()+800},1000);
)

# highlight the top nav as scrolling occurs
$('body').scrollspy({ target: '#navbar' })
