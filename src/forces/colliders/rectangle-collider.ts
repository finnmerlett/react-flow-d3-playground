import { Force } from 'd3-force';
import { quadtree, QuadtreeLeaf } from 'd3-quadtree';
import { DataLinkData, DataNodeData } from '../../nodes-edges.ts';

export function rectangleCollider() {
  // Initialize an array to hold nodes data.
  let nodes: DataNodeData[] = [];

  // Define the force function applying a custom force to nodes based on D3's force simulation.
  const force: Force<DataNodeData, DataLinkData> = (alpha) => {
    // Apply a custom adjustment to the alpha parameter to modify the force's strength.
    const hardAlpha = 1;

    // Create a quadtree from the nodes to efficiently find nearby nodes.
    const tree = quadtree(
      nodes,
      (d) => d?.x || Number.NaN, // Define the x-coordinate accessor for quadtree.
      (d) => d?.y || Number.NaN, // Define the y-coordinate accessor for quadtree.
    );

    // Iterate over each node to apply collision detection and resolution.
    nodes.forEach((node) => {
      // Half dimensions of the current node for collision detection.
      const w = node.width / 2;
      const h = node.height / 2;
      // Calculate the bounding box of the current node.
      const nx1 = node.x - w;
      const nx2 = node.x + w;
      const ny1 = node.y - h;
      const ny2 = node.y + h;

      // Use the quadtree to efficiently visit and check for collisions with other nodes.
      tree.visit((quad, x1, y1, x2, y2) => {
        // Skip non-leaf nodes because they will not represent individual nodes.
        if (quad.length) return;

        let quadNext: QuadtreeLeaf<DataNodeData> | undefined = quad;
        do {
          const quadNode = quadNext.data;
          // Check if the quadData is not the current node to avoid self-collision.
          if (quadNode !== node) {
            // Calculate the half dimensions for the quadNode.
            const w2 = quadNode.width / 2;
            const h2 = quadNode.height / 2;

            // Vector from node to quadNode
            const dx = quadNode.x - node.x;
            const dy = quadNode.y - node.y;

            // Minimum non-overlapping distances along x and y axes for rectangles
            const minDistX = w + w2;
            const minDistY = h + h2;

            // Actual distance between node centers
            const distX = Math.abs(dx);
            const distY = Math.abs(dy);

            // Calculate overlap depth along both axes
            const overlapX = minDistX - distX;
            const overlapY = minDistY - distY;

            if (overlapX > 0 && overlapY > 0) {
              // Calculate x-y displacement fractions (keep only the min-overlap axis)
              const fracX = Math.sign(dx) * Number(overlapX < overlapY);
              const fracY = Math.sign(dy) * Number(overlapY <= overlapX);

              // Apply displacement proportional to overlap and adjusted by hardAlpha
              const displacementX = fracX * overlapX * hardAlpha;
              const displacementY = fracY * overlapY * hardAlpha;

              node.x -= displacementX;
              node.y -= displacementY;
              quadNode.x += displacementX;
              quadNode.y += displacementY;
            }
          }

          // Move to the next node in the quadtree.
          quadNext = quadNext.next;
        } while (quadNext && quadNext !== quad);

        // Stop visiting if the quadtree section does not intersect with the node's bounding box.
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    });
  };

  // Provide the force function with a method to initialize nodes.
  force.initialize = (newNodes) => (nodes = newNodes);

  return force;
}

export default rectangleCollider;
