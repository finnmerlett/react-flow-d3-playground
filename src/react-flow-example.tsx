import {
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
} from 'd3-force';
import { useMemo, useState } from 'react';
import {
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useStore,
} from 'reactflow';
import 'reactflow/dist/style.css';
import ellipseCollider from './forces/colliders/ellipse-collider.ts';
import { linkStraightener } from './forces/link-straightener.ts';
import {
  DataLink,
  DataLinkData,
  DataNodeData,
  initialEdges,
  initialNodes,
} from './nodes-edges.ts';

type LayoutedElement = [boolean, { toggle: () => boolean }];

const simulationBase = forceSimulation<DataNodeData, DataLinkData>()
  .force('charge', forceManyBody().strength(-500))
  .force('x', forceX().x(0).strength(0.03))
  .force('y', forceY().y(0).strength(0.03))
  .force('collide', ellipseCollider())
  .alphaTarget(0.05)
  .stop();

const useLayoutedElements = () => {
  const { fitView, getEdges, getNodes, setNodes } = useReactFlow<
    DataNodeData,
    DataLinkData
  >();
  const initialised = useStore((store) =>
    [...store.nodeInternals.values()].every(
      (node) => node.width && node.height,
    ),
  );

  return useMemo((): LayoutedElement => {
    const forceNodes: DataNodeData[] = getNodes().map((node) => ({
      ...node.data,
      x: node.position.x,
      y: node.position.y,
    }));
    const edges = getEdges();
    let running = false;

    // If React Flow hasn't initialised our nodes with a width and height yet, or
    // if there are no nodes in the flow, then we can't run the simulation!
    if (!initialised || forceNodes.length === 0) {
      return [false, { toggle: () => false }];
    }

    // Configuring the link force
    const linkForce = forceLink<DataNodeData, DataLink>(edges)
      .id((d) => d.id)
      .strength(0.15)
      .distance(150);

    simulationBase
      .nodes(forceNodes)
      .force('link', linkForce)
      .force('straightener', linkStraightener(edges));

    // The tick function is called every animation frame while the simulation is
    // running and progresses the simulation one step forward each time.
    const tick = () => {
      getNodes().forEach((node, i) => {
        const dragging = Boolean(
          document.querySelector(`[data-id="${node.id}"].dragging`),
        );

        // Setting the fx/fy properties of a node tells the simulation to "fix"
        // the node at that position and ignore any forces that would normally
        // cause it to move.
        forceNodes[i].fx = dragging || !running ? node.position.x : null;
        forceNodes[i].fy = dragging || !running ? node.position.y : null;
      });

      simulationBase.tick();
      setNodes(
        getNodes().map((node, i) => ({
          ...node,
          position: {
            x: forceNodes[i].x,
            y: forceNodes[i].y,
          },
        })),
      );

      window.requestAnimationFrame(() => {
        // Give React and React Flow a chance to update and render the new node
        // positions before we fit the viewport to the new layout.
        fitView({ duration: 100, padding: 0.2 });

        // Schedule another tick.
        setTimeout(tick, 0);
      });
    };

    const toggle = () => {
      running = !running;
      return running;
    };

    window.requestAnimationFrame(tick);

    return [true, { toggle }];
  }, [fitView, getEdges, getNodes, initialised, setNodes]);
};

const LayoutFlow = () => {
  const [running, setRunning] = useState(false);
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [initialised, { toggle }] = useLayoutedElements();

  return (
    <ReactFlow
      edges={edges}
      nodes={nodes}
      onEdgesChange={onEdgesChange}
      onNodesChange={onNodesChange}
    >
      <Panel position="top-left">
        {initialised && (
          <button onClick={() => setRunning(toggle())}>
            {running ? 'Stop' : 'Start'} force simulation
          </button>
        )}
      </Panel>
    </ReactFlow>
  );
};

export function ReactFlowExample() {
  return (
    <ReactFlowProvider>
      <LayoutFlow />
    </ReactFlowProvider>
  );
}
