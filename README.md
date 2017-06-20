# BXSK

**Barebones node.js & Express Starter Kit**

![](pic.jpg)

For Express 4.15, tested with Node 7.10 (should work fine with olther though, enven LTS, as no fancy stuff is used).

It uses Handlebars for frontend, and includes a setup for hybrid-templates
(that can render on either browser or server, depending on what your code
decides in a particular situation) and for server-client-isomorphic js
code (modules that work both in server app code and in browser). Yeah, this
is *far from what folks would call "bare bones"...* but I tend to naively
assume that you **want** or **"need"** these features, otherwise why TF
would you use Node.js?! (Really, try Python/Django^Flask, Ruby/Rails^Sinatra, Elixir/Phoenix, Go/* etc. ...they are all more "brain
friendly" and will save you weeks/months/years of time wasted debugging
and re-re-...-re-upgrading the zillions of nano-libs you use.)

Also, it's freakin 2017, so obviously you want a proper REST API at least.
And it should also support things like file uploads, of course. So there's
a bunch of boilerplate for that (ripped from other app, not fully tested,
but if it breaks, you probably just need to rename some vars in it etc.).

Also, the controllers pattern used... It involves creating a fresh new
instance of the controller for each request and calling it's appropriate
method. This allows more classic controller inheritance patterns etc.
But *it's not an excuse for putting all your logic in the controller just
because now you can!* If you do that, you deserve the pain of having to
write tests for such an app... or the pure torture of living with a
test-less app.

(Mini-frontend part uses Materialize.css installed via NPM and the
simplest practical Gulp-based SASS-supporting build process I
could think of - feel free to rip it off and replace it it with
whatever you like, or **better** to *develop the frontend as a
separate app* and use this only for APIs and platform admin.)

## What? Why?

The point of it is to be *really* **bare bones**: more "real world" starter kits includes way too much stuff and too many options. But at the same time **realistic** - it's freakin 2017, obviously you want a proper REST API at least. Yabba Dabba Doo!

(Btw, there's a ["just copy it", no-generator/Yo version](https://github.com/NeuronQ/barebones-express-starter-kit)
available too if you really wanna do it caveman style.)

**DISCLAIMER:** Obviously there is no guarantee that this, as is, is *anything close to secure.* Do not deploy apps you haven't thoroughly
secured yourself. When it comes to security it never hurts to repeat
that *"The world is cruel!"* ([OWASP](https://www.owasp.org/)).

## How to make a real project from it

```
yo bb-express-sk --appName "Awesome App" --appSlug awesome_app
```

(If you do not provide the options it will prompt you for them,
also it will try to generate the slug from the name if not give.)

**Note:** if anything fails it's probably `npm install`, so rerun it manually
an check what dependency blew up on install (either main app dep from `src/` or
frontend dep from `src/assets/`, as both dirs have separate `package.json` files).

### Yey! Ready to run

```
cd src
./dev-run.sh
```

(Or `whatch-n-run.sh` for auto-reloading app code and rebuilding
frontend - but *browser live-reload* is not baked in, this is for you to
set up yourself.)

### Working on frontend

1. Ensure you have `gulp` and watever else it may need installed globally.
2. If Yo init failed or whatever, in `src/assets/` run `./init.sh`.

To rebuild later, from `src/assets/` use `gulp`. To watch
for changes and auto-rebuild leave `gulp watch` running. (Or use the
`src/watch-n-run.sh` script that also realoads modified app files.)

**NOTE:** If you actually use this frontend skeleton, *read the Gulpfile
and understand what/how it does!*

Roughly how it works (explanation for frontend devs):

```
src/assets/ & src/common/  # file the frontend dev edits
\
 \-[gulp / gulp watch]
  \
   \=> src/public/  # static files are served from here

src/templates/
\
 \-[app code]  # renders templates and does most stuff (also
  \            # servers src/templates/shared as is so they can
   \           # be rendered by client-side code when needed
    \
     \-> rendered by app
```
