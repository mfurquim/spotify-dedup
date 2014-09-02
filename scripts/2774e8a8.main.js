var OAuthConfig=function(){"use strict";var a,b="04dca0de1c4e4aca88cc615ac23581be";a="localhost:8000"===location.host?"http://localhost:8000/callback.html":"http://jmperezperez.com/spotify-dedup/callback.html";var c=/http[s]?:\/\/[^/]+/.exec(a)[0];return{clientId:b,redirectUri:a,host:c}}(),OAuthManager=function(){"use strict";function a(a){var b=[];for(var c in a)a.hasOwnProperty(c)&&b.push(encodeURIComponent(c)+"="+encodeURIComponent(a[c]));return b.join("&")}function b(b){b=b||{};var c=new Promise(function(c,d){function e(a){return clearInterval(g),a.origin!==OAuthConfig.host?void d():(null!==f&&(f.close(),f=null),window.removeEventListener("message",e,!1),void c(a.data))}var f=null,g=null;window.addEventListener("message",e,!1);var h=400,i=600,j=screen.width/2-h/2,k=screen.height/2-i/2,l={client_id:OAuthConfig.clientId,redirect_uri:OAuthConfig.redirectUri,response_type:"token"};b.scopes&&(l.scope=b.scopes.join(" ")),f=window.open("https://accounts.spotify.com/authorize?"+a(l),"Spotify","menubar=no,location=no,resizable=no,scrollbars=no,status=no, width="+h+", height="+i+", top="+k+", left="+j),g=setInterval(function(){null!==f&&f.closed&&(clearInterval(g),d({message:"access_denied"}))},1e3)});return c}return{obtainToken:b}}(),PromiseThrottle=function(){"use strict";function a(a){e.push(a),c()}function b(){if(e.length){var a=e.splice(0,1);a[0]()}else clearInterval(f),f=null}function c(){null===f&&(f=setInterval(b,1e3/d))}var d=5,e=[],f=null;return{registerPromise:a}}();!function(){"use strict";function a(a){this.playlist=a,this.duplicates=ko.observableArray([]);var b=this;this.removeDuplicates=function(){PromiseThrottle.registerPromise(function(){return g.removeTracksFromPlaylist(b.playlist.owner.id,b.playlist.id,b.duplicates().map(function(a){return{uri:a.track.uri,positions:[a.index]}})).then(function(){b.duplicates([]),b.status("Duplicates removed")})})},this.status=ko.observable(""),this.processed=ko.observable(!1)}function b(){var a=this;this.playlists=ko.observableArray([]),this.isLoggedIn=ko.observable(!1),this.toProcess=ko.observable(100),this.duplicates=ko.computed(function(){var b=0;return ko.utils.arrayForEach(a.playlists(),function(a){b+=ko.utils.unwrapObservable(a.duplicates()).length}),b})}function c(b){h.isLoggedIn(!0),f=b,g=new SpotifyWebApi,g.setAccessToken(f),PromiseThrottle.registerPromise(function(){return g.getMe().then(function(b){var c=b.id;PromiseThrottle.registerPromise(function(){return g.getUserPlaylists(c).then(function(b){var e=b.items.filter(function(a){return a.owner.id===c});h.playlists(e.map(function(b){return new a(b)})),h.toProcess(h.playlists().length),h.playlists().forEach(d)})})})})}function d(a){var b={};PromiseThrottle.registerPromise(function(){return e(g.getGeneric(a.playlist.tracks.href)).then(function(a){return Promise.all(a)}).then(function(c){c.forEach(function(c){var d=c.offset;c.items.forEach(function(c,e){null!==c.track.id&&(c.track.id in b?a.duplicates.push({index:d+e,track:c.track}):b[c.track.id]=!0)})}),a.processed(!0),h.toProcess(h.toProcess()-1)}).catch(function(){a.processed(!0),h.toProcess(h.toProcess()-1)})})}function e(a){return new Promise(function(b,c){a.then(function(c){for(var d=[a],e=c.limit+c.offset,f=c.limit;c.total>e;)d.push(g.getGeneric(c.href+"?offset="+e+"&limit="+f)),e+=f;b(d)}).catch(function(){c([])})})}var f,g,h;h=new b,ko.applyBindings(h),document.getElementById("login").addEventListener("click",function(){OAuthManager.obtainToken({scopes:["playlist-read-private","playlist-modify-public","playlist-modify-private"]}).then(function(a){c(a)}).catch(function(a){console.error(a)})})}();