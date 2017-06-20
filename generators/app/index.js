const Generator = require('yeoman-generator');


module.exports = class extends Generator {
  // The name `constructor` is important here
  constructor(args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);

    this.option('appName', { type: String, required: true });
  }

  prompting() {
    if (this.options.appName && !this.options.appSlug) {
      this.options.appSlug = this.options.appName.split(/[\s_-]+/).map(w => w.toLowerCase()).join('_');
    }
    if (!this.options.appName || !this.options.appSlug) {
      return this.prompt([
        {
          type    : 'input',
          name    : 'appSlug',
          message : 'App slug',
          default : this.appname, // Default to current folder name
        },
        {
          type    : 'input',
          name    : 'appName',
          message : 'App name',        
        },
      ]).then((answers) => {
        this.options.appName = this.options.appName || answers.appName;
        this.options.appSlug = this.options.appSlug || answers.appSlug;
      });
    }
  }

  render() {
    this.log('-- rendering');

    this.fs.copy(
      this.templatePath('copy_raw/**'),
      this.destinationRoot(),
      { globOptions: { dot: true } }
    );

    this.fs.copyTpl(
      this.templatePath('copy_rendered/**'),
      this.destinationRoot(),
      {
        appName: this.options.appName,
        appSlug: this.options.appSlug,
      },
      { globOptions: { dot: true } }
    );
  }

  end() {
      var done = this.async();
      this.spawnCommand('npm', ['install'], {cwd: 'src'})
      .on('close', () => this.spawnCommand('sh', ['init.sh'], {cwd: 'src/assets'}))
      .on('close', done);
  }
}
