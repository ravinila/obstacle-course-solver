import React, { Component } from "react";
// import { GameContext } from "./../common/context"

export default class Settings extends Component {
    constructor(props) {
        super(props);
        this.props = props;
        
    }
    updateSettings(){
        console.log("test")
        this.props.updateSettings({
            // rows: this.refs.rows.value,
            // cols: this.refs.cols.value,
            diagonal: 11,
            shortest: this.refs.shortest.checked
        });
    }
    
    render() {
        
        return (
            <div>
            {
                // <input type="number" ref="rows" defaultValue={this.props.rows} />
                // <input type="number" ref="cols" defaultValue={this.props.cols} />
                // <input type="checkbox" ref="diagonal" id="diagonal" defaultChecked={this.props.diagonalPathAllowed} /> <label for="diagonal">Allow diagonal</label>
            }
            <input type="checkbox" ref="shortest" id="shortest" defaultChecked={this.props.shortest} onClick={this.updateSettings.bind(this)} /> <label for="shortest">Find shortest route by distance</label>
            {
                // <button onClick={this.updateSettings.bind(this)}>Update</button>
            }
            </div>
        );
    }
}
