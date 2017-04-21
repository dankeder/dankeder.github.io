var
  gulp  = require('gulp'),
  semantic_watch = require('./semantic/tasks/watch'),
  semantic_build = require('./semantic/tasks/build')
;

// import semantic-ui tasks
gulp.task('watch', semantic_watch);
gulp.task('build', semantic_build);
