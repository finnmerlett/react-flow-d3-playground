import { Force } from 'd3-force';
import { quadtree, QuadtreeLeaf } from 'd3-quadtree';
import { DataLinkData, DataNodeData } from '../../nodes-edges.ts';

export function circleCollider() {
  let nodes: DataNodeData[] = [];

  const force: Force<DataNodeData, DataLinkData> = (alpha) => {
    const hardAlpha = alpha ** 0.2;

    // Create a quadtree to efficiently find potential node collisions.
    const tree = quadtree(
      nodes,
      (d) => d?.x || Number.NaN,
      (d) => d?.y || Number.NaN,
    );

    nodes.forEach((node) => {
      // Calculate the radius from the node's width for collision detection.
      const r = Math.max(node.width, node.height) / 2;
      // Calculate the bounding box of the current node's collider area.
      const nx1 = node.x - r;
      const nx2 = node.x + r;
      const ny1 = node.y - r;
      const ny2 = node.y + r;

      // Visit each node in the quadtree to check for collisions with the current node.
      tree.visit((quad, x1, y1, x2, y2) => {
        if (quad.length) return; // Skip internal nodes by checking if they have length property.

        let quadNext: QuadtreeLeaf<DataNodeData> | undefined = quad;
        do {
          const quadNode = quadNext.data;
          // Check if the quadData is not the current node to avoid self-collision.
          if (quadNode !== node) {
            // Calculate the combined radii and distance between nodes to check for overlap.
            const r = node.width / 2 + quadNode.width / 2;
            let x = node.x - quadNode.x;
            let y = node.y - quadNode.y;
            // Compute the Euclidean distance between nodes.
            let l = Math.hypot(x, y);

            // If nodes are overlapping, adjust their positions to resolve the collision.
            if (l < r) {
              l = ((l - r) / l) * hardAlpha; // Calculate the adjustment factor.
              node.x -= x *= l; // Adjust this node's position.
              node.y -= y *= l;
              quadNode.x += x; // Adjust the other node's position.
              quadNode.y += y;
            }
          }
          quadNext = quadNext?.next; // Move to the next node in the quadtree.
        } while (quadNext);

        // Skip visiting further nodes if the current node's quadrant doesn't intersect with the query rectangle.
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    });
  };

  // Provide a method to update the nodes array with a new set of nodes.
  force.initialize = (newNodes) => (nodes = newNodes);

  return force; // Return the force function, ready to be used with d3's force simulation.
}
