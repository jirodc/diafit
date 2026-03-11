# Lanyard 3D assets

Place these two files in this folder so the “Built by Experts” 3D lanyard works:

- **card.glb** – 3D badge/card model (you can edit it at https://modelviewer.dev/editor/)
- **lanyard.png** – Texture for the lanyard band (edit in any image editor)

**Where to get them**

- Same-named assets are used in demos like [Vercel’s interactive 3D event badge](https://vercel.com/blog/building-an-interactive-3d-event-badge-with-react-three-fiber) (R3F + Rapier + meshline). Check that post’s CodeSandbox or repo for `card.glb` and `lanyard.png`.
- If your project has them under something like `src/assets/lanyard/`, copy those files here.

Until both files are present, the About page shows a placeholder instead of the 3D view.
