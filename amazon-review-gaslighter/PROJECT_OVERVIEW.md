## Technical Architecture

**Chrome Extension Only** - No backend needed! Everything runs client-side:
- Manifest V3 extension
- Content script that runs on Amazon product pages
- Local AI generation using browser APIs or embedded models

## Implementation Steps

### Phase 1: Basic Review Replacement (2 hours)
1. **Content Script Setup**
   - Target Amazon review containers (`[data-hook="review-body"]`, `.review-text`, etc.)
   - Detect when reviews load (including infinite scroll)
   
2. **Fake Review Generation**
   - Start with pre-written templates with variables: "Great {product_type} but why does it {weird_action}?"
   - Extract actual product name/type from page title
   - Simple JavaScript template system with randomization

3. **UI Integration**
   - Replace review text while preserving star ratings and reviewer names
   - Keep original Amazon styling so it looks authentic

### Phase 2: AI-Generated Reviews (1.5 hours)
**Option A: Browser-based AI (Fastest)**
- Use Chrome's built-in AI APIs (Origin Trial) if available
- Or embed a tiny local model like TinyLlama via ONNX.js

**Option B: API calls (Backup)**
- OpenAI API calls directly from extension
- User provides their own API key in extension options
- Cache responses to avoid repeated calls

### Phase 3: Fake Review Images (30 minutes)
- Generate placeholder images with Canvas API
- Create "review photos" that are just abstract art or random patterns
- Style them to match Amazon's review image layout
- No actual AI image generation needed for MVP - just convincing-looking nonsense

## File Structure
```
/extension
  manifest.json
  content.js (main logic)
  options.html (API key input)
  templates.js (review templates)
  styles.css (minor UI fixes)
```

## Key Technical Decisions
- **No permissions beyond Amazon domains** - keeps approval simple
- **Graceful degradation** - falls back to templates if AI fails
- **Preserve original functionality** - users can still see real reviews if needed

Want me to start building this? The template-based version could be done in under an hour!
