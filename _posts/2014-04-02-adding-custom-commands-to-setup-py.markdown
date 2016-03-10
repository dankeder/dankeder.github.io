---
layout:     post
title:      "Adding custom commands to setup.py"
subtitle:   ""
date:       2014-04-02 14:20:13 +0200
author:     "Dan Keder"
excerpt_separator: <!--more-->
---

I'm often using [Setuptools](http://pythonhosted.org/setuptools/) to package
and distribute Python modules. Recently I needeed to add a custom command
to `setup.py` so I can run it like this:

    $ python setup.py mycommand --option --another-option value

The official documentation of Setuptools isn't very specific on how to do it so
here is what I came up with after a little research.

<!--more-->

Long story short: We need to subclass the class `setuptools.Command` and
register it with Setuptools.


Create the command class
------------------------

So we do not work with an overly artificial example, let's make a command for
converting `*.svg` image files into PNGs. Let's call it `gen_images`.

- Create the `GenImagesCommand` class by subclassing `setuptools.Command`. Put it
  directly into `setup.py`.

- Initialize the class attribute `user_options`. It is a list of tuples where
  each tuple corresponds to a single command-line option. The tuple consists of
  the option long name, short name (without the leading '--' and '-') and
  description. Options are parsed using the `distutils.fancy_getopt` module.

        user_options = [
                ('input-dir=', 'i', 'input directory'),
                ('output-dir=', 'o', 'output directory'),
            ]

- Implement the method `initialize_options()`. It is used to initialize the options to
  default values.

        def initialize_options(self):
            self.input_dir = None
            self.output_dir = None


- Implement the method `finalize_options()`. It is used to check final option
  values. For example, you may want to check if a pathname exists, compute
  missing values or process dependencies between options.

        def finalize_options(self):
            if self.input_dir is None:
                raise Exception("Parameter --input-dir is missing")
            if self.output_dir is None:
                raise Exception("Parameter --output-dir is missing")
            if not os.path.isdir(self.input_dir):
                raise Exception("Input directory does not exist: {0}".format(self.input_dir))
            if not os.path.isdir(self.output_dir):
                raise Exception("Output directory does not exist: {0}".format(self.output_dir))


- Implement the method `run()`. The `run()` method does the "hard work" of the command:

        def run(self):
            def _gen_images(arg, dirname, fnames):
                for fname in fnames:
                    if self.verbose:
                        print 'processing "{0}"'.format(os.path.join(dirname, fname))
                    # FIXME: Really process the files here
            os.path.walk(self.input_dir, _gen_images, None)


- Optionally you can set the value of `description` class attribute. It is used to
  describe what the command does when you run `python setup.py --help-commands`.


Here is the complete `GenImagesCommand` class:

    import os
    from setuptools import Command


    class MyCommand(Command):
        """ Run my command.
        """
        description = 'generate images'

        user_options = [
                ('input-dir=', 'i', 'input directory'),
                ('output-dir=', 'o', 'output directory'),
            ]

        def initialize_options(self):
            self.input_dir = None
            self.output_dir = None

        def finalize_options(self):
            if self.input_dir is None:
                raise Exception("Parameter --input-dir is missing")
            if self.output_dir is None:
                raise Exception("Parameter --output-dir is missing")
            if not os.path.isdir(self.input_dir):
                raise Exception("Input directory does not exist: {0}".format(self.input_dir))
            if not os.path.isdir(self.output_dir):
                raise Exception("Output directory does not exist: {0}".format(self.output_dir))

        def run(self):
            def _gen_images(arg, dirname, fnames):
                for fname in fnames:
                    if self.verbose:  # verbose is provided "automagically"
                        print 'processing "{0}"'.format(os.path.join(dirname, fname))
                    # FIXME: Really process the file here
            os.path.walk(self.input_dir, _gen_images, None)


Register the command in Setuptools
----------------------------------

Currently there are two ways to register the command class in the Setuptools
framework.

The first one is to add a `cmdclass` key to the `setup()` call in `setup.py`:

        setup(
                name="my-project",
                cmdclass={
                        'gen_images': GenImagesCommand,
                    },
                # other stuff ...
            )

The key is the command name, the value is the command class.

Another way to register the command is to use the `entry_points` key.

        setup(
                name="my-project",
                entry_points={
                    'distutils.commands': [
                            'gen_images = package.module:GenImagesCommand',
                        ],
                    },
                # other stuff ...
            )

This states that the command `gen_images` is implemented by the class
`GenImagesCommand` from the module `package.module`. The command class will be
automatically imported by Setuptools when it's needed. However, in this case the
command class must be stored in a separate module, not directly in `setup.py`.


Running the command
-------------------

Now is possible to run the command:

    $ python setup.py gen_images --input-dir assets/ --output-dir images/
    running gen_images
    processing "assets/a.svg"
    processing "assets/c.svg"
    processing "assets/b.svg"
