import React from 'react';
import R from 'ramda';
import Styles from '../shared/styles';
import Bbox from '../utils/bbox';
import SVGLayer from '../components/SVGlayer';
import Node from '../components/Node';
import Link from '../components/Link';

const backgroundStyle = {
  fill: '#eee'
};

export default class Patch extends React.Component {
  constructor(props) {
    super(props);

    this.viewState = this.createViewState(props);
    this.layers = [{
      name: 'background',
      childs: this.createBackground(),
    }, {
      name: 'links',
      childs: this.createLinks(props.links, this.viewState),
    }, {
      name: 'nodes',
      childs: this.createNodes(props.nodes, props.pins, this.viewState),
    }];

    console.log('patch: ', this.props);
    console.log('viewState: ', this.viewState);
  }

  createViewState(state) {
    const viewState = {};

    viewState.nodes = this.calcNodes(state.nodes);
    viewState.pins = this.calcPins(state.pins, viewState.nodes);
    viewState.links = this.calcLinks(state.links, viewState.pins, viewState.nodes);

    return viewState;
  }

  calcNodes(nodes) {
    const result = {};

    for (let i in nodes) {
      let node = nodes[i];

      result[i] = {
        id: node.id,
        bbox: new Bbox({
          x: node.position.x,
          y: node.position.y,
          width: Styles.svg.node.width,
          height: Styles.svg.node.height,
        }),
      };
    }

    return result;
  }

  calcPins(pins, nodesView) {
    const result = {};

    const pinsByNodes = R.groupBy((pin)=>{ return pin.nodeId; }, R.values(pins));

    for (let n in pinsByNodes) {
      const node = nodesView[n];
      const pinsByType = R.groupBy((pin)=>{ return pin.type; }, pinsByNodes[n]);

      const vOffset = {
        input: Styles.svg.node.padding.y - Styles.svg.pin.radius,
        output: node.bbox.getSize().height + Styles.svg.node.padding.y - Styles.svg.pin.radius
      };

      for (let type in pinsByType) {
        const count = pinsByType[type].length;
        const maxLength = count * Styles.svg.pin.radius + (count - 1) * Styles.svg.pin.margin;
        let offset = 0;

        for (let i in pinsByType[type]) {
          const pin = pinsByType[type][i];

          result[pin.id] = {
            id: pin.id,
            nodeId: node.id,
            type,
            bbox: new Bbox({
              x: node.bbox.getCenter().x - maxLength + offset,
              y: vOffset[type],
              width: Styles.svg.pin.radius * 2,
              height: Styles.svg.pin.radius * 2,
            }),
          };

          offset += Styles.svg.pin.margin;
        }
      }
    }

    return result;
  }

  calcLinks(links, pinsView, nodesView) {
    const result = {};

    for (let i in links) {
      const pinFrom = pinsView[links[i].fromPinId];
      const pinTo = pinsView[links[i].toPinId];
      const nodeFrom = nodesView[pinFrom.nodeId];
      const nodeTo = nodesView[pinTo.nodeId];

      result[i] = {
        id: links[i].id,
        from: pinFrom.bbox.addPosition( nodeFrom.bbox ),
        to: pinTo.bbox.addPosition( nodeTo.bbox )
      };
    }

    return result;
  }

  createNodes(nodes, pins, viewState) {
    const nodeChilds = [];
    const nodeFactory = React.createFactory(Node);

    for (let n in nodes) {
      const node = nodes[n];
      const nodePins = R.filter( R.propEq('nodeId', node.id), pins );

      nodeChilds.push(
        nodeFactory({
          key: node.id,
          node,
          pins: nodePins,
          style: Styles.svg,
          viewState,
        })
      );
    }

    return nodeChilds;
  }

  createLinks(links, viewState) {
    const linkChilds = [];
    const linkFactory = React.createFactory(Link);

    for (let i in links) {
      const link = links[i];

      linkChilds.push(
        linkFactory({
          key: link.id,
          link,
          viewState: viewState.links[i],
          style: Styles.svg.link,
        })
      );
    }

    return linkChilds;
  }

  createBackground() {
    const bgChilds = [];

    bgChilds.push(
      <rect
        key="bg" x="0" y="0"
        width={this.props.size.width} height={this.props.size.height}
        style={backgroundStyle}
      />
    );

    return bgChilds;
  }

  render() {
    return (
      <svg width={this.props.size.width} height={this.props.size.height} xmlns="http://www.w3.org/2000/svg">
        {this.layers.map(layer =>
          <SVGLayer key={layer.name} name={layer.name} childs={layer.childs} />
        )}
      </svg>
    );
  }
}

Patch.propTypes = {
  links: React.PropTypes.Object,
  nodes: React.PropTypes.Object,
  pins: React.PropTypes.Object,
  size: React.PropTypes.Object,
};
