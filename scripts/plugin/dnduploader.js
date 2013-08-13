(function($) {
  var methods = {
    init : function( options ) {

      return this.each(function(){
        var $this = $(this);

        $.each(options,function(label,setting) {
          $this.data(label,setting);
        });

        $this.bind('dragenter.dndUploader', methods.dragEnter);
        $this.bind('dragover.dndUploader', methods.dragOver);
        $this.bind('drop.dndUploader', methods.drop);
      });
    },

    dragEnter : function (e) {
      e.stopPropagation();
      e.preventDefault();
      return false;
    },

    dragOver : function (e) {
      e.stopPropagation();
      e.preventDefault();
      return false;
    },

    drop : function(e) {
      e.stopPropagation();
      e.preventDefault();

      var $this = $(this);
      var dataTransfer = e.originalEvent.dataTransfer;
      var fileName = '';
      if (dataTransfer.files.length > 0) {
        $.each(dataTransfer.files,function(i,file) {
          //var xhr = new XMLHttpRequest();
          //var upload = xhr.upload;
          //xhr.open('post', $this.data('url'),true);
          //xhr.setRequestHeader('X-Filename',fie.fileName);

          //xhr.send(file);
          twitterLib.uploadYfrog(file,function() {
          });
        });
      }
      return false;
    }
  };
 
  $.fn.dndUploader = function( method ) {
    if ( methods[method] ) {
      return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.dndUploader' );
    }
  };
})(jQuery);
