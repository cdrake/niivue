# NiiVue

## *** THIS REPO HAS BEEN MOVED ***

new location: https://github.com/niivue/niivue

- [Overview]()
- [Development Environment]()
- [Usage]()

## Overview

NiiVue is a minimalist webgl [nifti](https://nifti.nimh.nih.gov) image viewer (for now). 

The goal is to have a simple viewer component that can be embedded in an existing web page. The component can be simply embedded into any web page. Optionally, the component can be controlled by other widgets on the web page, for example controls that allow the user to set the contrast, color scheme and other properties. 

## Live View 

[Load a NiiVue web page](https://hanayik.github.io/niivue/)

## Requirements

- WebGL2 enabled browser (Chrome, FireFox or Safari Technology Preview).
- Several node modules should be automatically installed, including the [NIFTI-Reader-JS](https://github.com/rii-mango/NIFTI-Reader-JS).
 
## Contributors

- [Taylor Hanayik](https://github.com/hanayik)
- [Chris Rorden](https://github.com/neurolabusc)
- [Christopher Drake](https://github.com/cdrake)

## Acknowledgements 

- [shader.js source](https://github.com/Twinklebear/webgl-util)

## Alternatives

There are several open source JavaScript NIfTI viewers. What makes niivue unique is that it is a self contained Vue.js component. This makes it easy to integrate with Vue web pages. Unlike many alternatives, niivue does not use [three.js](https://threejs.org). This means the WebGL calls are tuned for voxel display, and the screen is only refreshed when needed (preserving battery life and helping your computer do other tasks). On the other hand, niivue does not have access to the three.js user interface widgets, requiring the developer to use vue.js components. Since there are numerous free alternatives, you can choose the optimal tool for your task.
[Francesco Giorlando](https://f.giorlando.org/2018/07/web-viewers-for-fmri/) describes some of the differences between different tools.


| Tool                                                                     | Live Demos                                                         |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| [AMI](https://github.com/FNNDSC/ami)                                     | [live demo](https://fnndsc.github.io/ami/)                         |
| [BioImage Suite Web Project](https://github.com/bioimagesuiteweb/bisweb) | [live demo](https://bioimagesuiteweb.github.io/webapp/viewer.html) | 
|  [BrainBrowser](https://brainbrowser.cbrain.mcgill.ca/)                  | [live demo](https://brainbrowser.cbrain.mcgill.ca/volume-viewer)   | 
|  [nifti-drop](https://github.com/vsoch/nifti-drop)                       | [live demo](http://vsoch.github.io/nifti-drop)                     | 
|  [Med3web](https://lifescience.opensource.epam.com/mri/)                 | [live demo](https://med3web.opensource.epam.com/)                  | 
|  [MRIcroWeb](https://github.com/rordenlab/MRIcroWeb)                     | [live demo](https://rordenlab.github.io)                           |  
|  [Papaya](https://github.com/rii-mango/Papaya)                           | [live demo](https://papaya.greenant.net/)                          | 
|  [VTK.js](https://github.com/Kitware/vtk-js)                             | [live demo](https://kitware.github.io/paraview-glance/app/)        | 

## Development Environment

### Development Installation

```
# You must install nodejs on your system FIRST!

# Use https protocol also if you want
git clone git@github.com:hanayik/niivue.git

cd niivue

npm install
```

### Compiles and hot-reloads for development
```
# nifti files are stored in /public
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Core data loading concepts

`niivue.js` functions should be designed to accept an `overlayList` (Array) such as:

```
overlayList: [
    {
      volumeURL: "./mni152.nii.gz",
      volume: {hdr: null, img: null},
      name: "mni152.nii.gz",
      intensityMin: 0,
      intensityMax: 100,
      intensityRange:[0, 100],
      colorMap: "gray", // gray
      opacity: 100,
    },
    {
      volumeURL: "./chris_T1.nii.gz",
      volume: {hdr: null, img: null},
      name: "chris_T1.nii.gz",
      intensityMin: 0,
      intensityMax: 100,
      intensityRange:[0, 100],
      colorMap: "gray", // gray
      opacity: 100,
    }
]

```

This `overlayList` informs niivue WebGL calls about most rendering related settings. For now, only the first item in the array is rendered until overlays (layering) is actually supported. 



