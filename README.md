# Like-Reels test demo

Zero dependency, run `node server.js` and open `localhost:8080` on the same machine or use local IP-address with the same port to open from another / mobile

## Requirements

Create an *infinite* video feed with vertical scrolling/swiping, like Reels/TikTok. It should work on desktop and mobile.
Infinite requirement comes from the reference and adds complexity to the task.

## Implementation

- 5 slides in DOM, recycled by reassigning videoIndex and src. No creation/destruction of nodes. 5 slides chosen to provide 2-slide buffer on each side with video preloading for slow connections.
- Positioned with translateY((videoIndex - currentIndex) * 100%). No scroll.
- Pointer events + CSS transforms, touch-action: none to prevent browser from intercepting gestures.

## Features

- Infinite feed, only 5 items in DOM with recycling
- Swipe, Mouse Wheel and Arrow navigation
- Drag-follow animation for swipe based on velocity and distance
- The global audio toggle
- Pause functionality: hold, click, on tab switch
- Generated thumbnail placeholders from the first frame for slow connections with `generate-thumbs.js` script.
- Progress bar based on timeUpdate event

## Limitations

Videos uploaded directly to the repo. Fetching of real feed is out of scope.

## Possible improvements

Remove CSS transition and use requestAnimationFrame and easing functions. It requires more code and worth to implement in real product. Current one is good enough for demo.

## Discarded options

- CSS Scroll snap. Since there is an infinite scroll in requirements it's not suitable here, it works good with finite lists and gives control to browser.
- Intersection observer. It's not navigation tool, it's just a reactive mechanism to know what's inside viewport. The current solution already knows currentIndex, no need anything else to know it.
- View Transition API. Designed to navigate between pages, can't do drag-follow swipes by default. And has no features beyond what's already added.

