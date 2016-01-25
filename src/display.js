const React = require('react');

class Display extends React.Component {
    render() {
        const style = {
            fontFamily: 'helvetica-light',
            fontSize: 28
        };
        return <div style={style}>{this.props.math}</div>;
    }
}

module.exports = Display;
