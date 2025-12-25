# WebAR Troubleshooting Guide

## Common Issues

### iOS Safari: "AR Not Supported" Error

**Problem**: iOS Safari shows "AR not supported" message even on iPhone 15 Pro.

**Cause**: iOS Safari has limited WebXR support. While iOS 17+ includes WebXR, the `immersive-ar` mode is not fully supported.

**Solutions**:
1. **Current limitation**: WebXR AR is experimental on iOS Safari
2. **Alternative**: Consider using a native iOS app with ARKit for better iOS support
3. **Fallback**: Show a 3D model viewer instead of AR on iOS devices

### Android Chrome: Blank White Page

**Problem**: After clicking AR button, instructions appear briefly then a blank white page shows.

**Possible Causes**:
1. WebXR session failed to initialize
2. Canvas rendering error
3. JavaScript error preventing render
4. Missing camera permissions

**Debugging Steps**:
1. Open Chrome DevTools (connect device via USB and enable remote debugging)
2. Check Console for JavaScript errors
3. Verify camera permissions are granted
4. Check if WebXR session is starting:
   - Look for XRButton in the page
   - Check if camera feed appears
   - Look for WebXR-related errors

**Fixes**:
1. Ensure the page is served over HTTPS (WebXR requires secure context)
2. Grant camera permissions when prompted
3. Check browser console for specific errors
4. Verify WebXR is supported: Visit `chrome://flags` and enable "WebXR Incubations" if needed

### XRButton Not Visible

**Problem**: Cannot see button to start AR session.

**Solution**: The XRButton from `@react-three/xr` should render automatically. If not visible:
1. Check if Canvas is rendering properly
2. Verify React Three XR is properly installed
3. Check browser console for errors

### Models Not Loading

**Problem**: 3D models don't appear in AR.

**Debugging**:
1. Check network tab for failed model requests
2. Verify model URLs are accessible
3. Check CORS settings on API
4. Verify GLB files are valid
5. Check browser console for loading errors

### Performance Issues

**Problem**: AR experience is laggy or slow.

**Solutions**:
1. Reduce model complexity
2. Limit number of placed objects
3. Optimize texture sizes
4. Lower DPR setting in Canvas
5. Close other apps to free memory

## Testing Checklist

- [ ] Tested on Android Chrome 90+
- [ ] HTTPS enabled (required for WebXR)
- [ ] Camera permissions granted
- [ ] WebXR support confirmed in browser
- [ ] Models load successfully
- [ ] AR session starts without errors
- [ ] Objects can be placed and manipulated
- [ ] No console errors

## Browser Console Commands

Check WebXR support:
```javascript
navigator.xr?.isSessionSupported('immersive-ar').then(supported => console.log('AR supported:', supported))
```

Check current XR session:
```javascript
// In React Three Fiber context
const { gl } = useThree()
console.log('XR session:', gl.xr?.getSession())
```

