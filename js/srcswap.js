var sourceSwap = function () {
    var $this = $(this);
    var newSource = $this.data('altsrc');
    $this.data('altsrc', $this.attr('src'));
    $this.attr('src', newSource);
}

$(function () {
    $('img.logo-navbar').hover(sourceSwap, sourceSwap);
});
var color=["yellow","blue","red","green","white"];
var index = 0;
var colorchg = function(color){
	$('h1').css('color',color);
	};
setInterval("colorchg(color[++index%color.length])",1500);
