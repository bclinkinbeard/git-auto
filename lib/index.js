
/**
 * Module dependencies.
 */

var exists = require('fs').exists;
var Git = require('gity');

/**
 * Expose `auto`.
 */

module.exports = auto;

/**
 * Handle git things.
 *
 * @param {Object} opts
 */

function auto(opts){
  opts = opts || {};
  var git = new Git();
  
  if (!exists('.git')) git.init();
  
  git
    .status('--porcelain')
    .run(function(err, res){
      var mapping = { created: 'added', untracked: 'added', deleted: 'deleted', modified: 'updated' };
      
      for (var status in res.message) {
        res.message[status].forEach(function(file){
          if (status === 'deleted') return;
          git.add(file);
          var msg = mapping[status] + ' ' + file.toLowerCase();
          git.commit('-m ' + '"' + msg + '"');
        })
      }
      
      var deleted = res.message.deleted;

      if (deleted.length === 1) {
        git.add(deleted[0]);
        git.commit('-m ' + 'deleted ' + deleted[0]);
      }
      
      if (deleted.length > 1) {
        deleted.forEach(function(file){ git.add(file); });
        git.commit('-m ' + '"deleted files"');
      }
      
      if (opts.push) git.push('origin master');
      
      git.run();
    });
}