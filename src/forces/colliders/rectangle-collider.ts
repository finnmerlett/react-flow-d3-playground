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
            // Calculate the half dimensions and bounding box for the quadData node.
            const w2 = quadNode.width / 2;
            const h2 = quadNode.height / 2;

            const mx1 = quadNode.x - w2;
            const mx2 = quadNode.x + w2;
            const my1 = quadNode.y - h2;
            const my2 = quadNode.y + h2;

            // Determine if there is overlap between the current node and quadData node.
            const hasOverlapX = nx1 < mx2 && nx2 > mx1;
            const hasOverlapY = ny1 < my2 && ny2 > my1;

            // Calculate the center distance between nodes on both axes.
            const dx = (nx1 + nx2) / 2 - (mx1 + mx2) / 2;
            const dy = (ny1 + ny2) / 2 - (my1 + my2) / 2;

            // Calculate the overlap amount on both axes.
            const overlapX = w + w2 - Math.abs(dx);
            const overlapY = h + h2 - Math.abs(dy);

            // If there is overlap, calculate the necessary displacement to resolve the collision.
            if (hasOverlapX && hasOverlapY) {
              const displacementX = Math.sign(dx) * overlapX;
              const displacementY = Math.sign(dy) * overlapY;

              // Resolve the collision along the axis of least overlap.
              if (overlapX < overlapY) {
                // Adjust positions along the x-axis.
                node.x += displacementX * hardAlpha;
                quadNode.x -= displacementX * hardAlpha;
              } else {
                // Adjust positions along the y-axis.
                node.y += displacementY * hardAlpha;
                quadNode.y -= displacementY * hardAlpha;
              }
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
