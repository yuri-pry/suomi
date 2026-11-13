---
ontology: true
type: guide
domain: suomi-app
status: active
summary: Commands and Android APK build steps for the Suomi app
tags: [readme, build]
related: [SPEC, todo]
---

# Suomi

A Finnish study app with short lessons. What it is and why: `SPEC.md`. What is built
and what is next: `tasks/todo.md`.

## Commands

```
npm install        once
npm run dev        run in the browser at http://localhost:5173
npm test           unit tests, then the content validator
npm run lint
npm run build      production build into dist/
npm run apk        build dist/, copy it into the Android project, build the APK
```

## Android APK

Needs, once per machine:

- JDK 21. Installed here with `winget install EclipseAdoptium.Temurin.21.JDK`.
- Android SDK with `platform-tools`, `platforms;android-36` and `build-tools;36.0.0`.
  Installed here in `C:\Users\marki\AppData\Local\Android\Sdk`.
- `android/local.properties` with one line pointing at the SDK (not in git):
  `sdk.dir=C:/Users/marki/AppData/Local/Android/Sdk`
- `JAVA_HOME` set to the JDK folder in the shell that runs the build, for example in
  Git Bash: `export JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-21.0.13.9-hotspot"`

Then `npm run apk`. The result is
`android/app/build/outputs/apk/debug/app-debug.apk`. The first build downloads Gradle
and takes about 5 minutes; later builds are much faster.

To install: copy the file to the phone and open it. Android asks once to allow
installing from that source. It is a debug build signed with a local debug key, which
is fine for personal use and cannot go to an app store.

The APK and the browser version keep separate progress.

## Content

How to write a unit: `content/AUTHORING.md`. Which grammar rules each unit adds:
`tasks/rulebook-map.md`. Every Finnish word is checked with Voikko by
`scripts/validate-content.mjs`.
