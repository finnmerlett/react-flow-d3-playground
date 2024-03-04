import { Force } from 'd3-force';
import { Edge } from 'reactflow';
import { DataLinkData, DataNodeData } from '../nodes-edges.ts';

export function linkStraightener(edges: Edge<DataLinkData>[]) {
  let nodes: DataNodeData[] = [];

  const force: Force<DataNodeData, DataLinkData> = (alpha) => {
    const idToNode = new Map(nodes.map((node) => [node.id, node]));

    // Iterate over each link
    for (const link of edges) {
      const source = idToNode.get((link.source as unknown as DataNodeData).id);
      const target = idToNode.get((link.target as unknown as DataNodeData).id);

      if (!source || !target) return; // Skip if source or target not found
      target.vx ??= 0;
      target.vy ??= 0;
      source.vx ??= 0;
      source.vy ??= 0;

      // Calculate the differences in x and y coordinates
      const dx = target.x - source.x;
      const dy = target.y - source.y;

      // Calculate the angle in radians between the line and the vertical
      const angleRadians = Math.atan2(-dy, dx);

      // Adjusting the angle to be between the line and a vertical line
      let angleFromVertical = angleRadians + Math.PI * 0.5;

      // Normalize the angle to be between -PI and PI
      if (angleFromVertical > Math.PI) angleFromVertical -= 2 * Math.PI;
      if (angleFromVertical < -Math.PI) angleFromVertical += 2 * Math.PI;

      // Calculate the force angle (tangent to the edge, measured from vertical)
      const forceAngle =
        -Math.sign(angleFromVertical) *
        (Math.PI * 0.5 - Math.abs(angleFromVertical));

      // Calculate the tangent vector components
      const tx = Math.sin(forceAngle);
      const ty = Math.cos(forceAngle);

      // Apply a force along the tangent vector, scaled by the angle from vertical
      const forceMagnitude = Math.abs(angleFromVertical) * 20 * alpha;
      const forceX = tx * forceMagnitude;
      const forceY = ty * forceMagnitude;

      // Directly modify the x and y coordinates of both the source and target
      target.vx += forceX;
      target.vy += forceY;
      source.vx -= forceX;
      source.vy -= forceY;
    }
  };

  force.initialize = (newNodes) => (nodes = newNodes);

  return force;
}
