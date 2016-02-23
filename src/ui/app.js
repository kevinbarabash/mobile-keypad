import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import Keypad from './keypad';
import Step from './step';
import MathRenderer from './math-renderer';
import store from './../store';


class AuxApp extends Component {
    static propTypes = {
        goal: PropTypes.any.isRequired,
        steps: PropTypes.arrayOf(PropTypes.any).isRequired,
        currentIndex: PropTypes.number.isRequired,
        activeIndex: PropTypes.number.isRequired,
    };

    select = i => {
        store.dispatch({
            type: 'SELECT_STEP',
            step: i
        });
    };

    componentDidMount() {
        const {offsetHeight, scrollHeight} = this.refs.container;

        if (scrollHeight > offsetHeight) {
            this.refs.container.scrollTop = scrollHeight - offsetHeight;
        }
    }

    render() {
        const { steps, currentIndex, activeIndex } = this.props;
        const currentStep = steps[currentIndex];
        const previousSteps = steps.slice(0, currentIndex);

        const style = {
            display: 'flex',
            flexDirection: 'column',
            height: this.props.height,
            width: this.props.width,
            backgroundColor: 'white'
        };

        const containerStyle = {
            flexGrow: 1,
            overflowY: 'scroll',
            overflowX: 'hidden',
            background: '#EEE',
            display: 'flex',
            // use column-reverse so that the current step is always first so
            // it doesn't change position
            flexDirection: 'column-reverse'
        };

        const lineStyle = {
            fontFamily: 'Helvetica-Light',
            fontSize: 26,
        };

        const goalStyle = {
            ...lineStyle,
            display: 'flex',
            flexDirection: 'row',
            paddingLeft: 20,
            paddingRight: 20,
            marginTop: 5,
            marginBottom: 5,
            flexShrink: 0,
            fontSize: 20,
        };

        const goal = <div style={goalStyle}>
            <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>Goal:</div>
            <div style={{ margin: 'auto' }}>
                <MathRenderer
                    fontSize={20}
                    math={this.props.goal}
                />
            </div>
        </div>;

        const history = [];

        previousSteps.forEach((step, i, steps) => {
            const previousActive = i - 1 === activeIndex;
            const active = activeIndex === i || previousActive;
            const maxId = previousActive && i > 0 && steps[i - 1].action && steps[i - 1].action.maxId || Infinity;
            const selections = step.active && step.action && step.action.selections || [];

            history.push(<Step
                {...step}
                onClick={() => this.select(i)}
                key={i}
                maxId={maxId}
                active={active}
                selections={selections}
            />);

            const style = {
                backgroundColor: '#444',
                color: 'white',
                fontFamily: 'helvetica-light',
                paddingLeft: 20,
                paddingRight: 20,
                paddingTop: 15,
                paddingBottom: 15,
            };

            if (step.active && step.action) {
                // TODO: handle nodes other than Literals
                if (step.action.value) {
                    const value = step.action.value.value;
                    const message = {
                        '+': `Add ${value} to both sides`,
                        '-': `Subtract ${value} from both sides`,
                        '*': `Multiply both sides by ${value}`,
                        '/': `Divide both sides by ${value}`,
                    }[step.action.operation];

                    history.push(<div key="action" style={style}>{message}</div>);
                } else if (step.action.transform) {
                    const message = step.action.transform.label;
                    history.push(<div key="action" style={style}>{message}</div>);
                }
            }
        });

        // reverse the history so it appears in the correct order since
        // flex-direction is column-reverse
        history.reverse();

        return <div style={style}>
            <div style={containerStyle} ref="container">
                <div style={{height:180,flexShrink:0}}></div>
                {<Step
                    {...currentStep}
                    onClick={() => this.select(-1)}
                    active={activeIndex >= previousSteps.length - 1}
                    key="currentStep"
                />}
                {history}
                <div style={{height:180,flexShrink:0}}></div>
            </div>
            {goal}
            <Keypad width={this.props.width}/>
        </div>;
    }
}

module.exports = connect(state => state)(AuxApp);
