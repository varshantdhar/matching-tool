import React from 'react'
import { getVennDiagramData, getTableData, getJailBarData, getHomelessBarData } from '../actions'
import { connect } from 'react-redux'
import d3 from 'd3'
import DurationBarChart from './bar'
import Venn from './venn'
import TableList from './table'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Header from './header'

const venn_diagram_data = [ {sets: ['Jail'], size: 500}, {sets: ['Homeless'], size: 340}, {sets: ['Jail','Homeless'], size: 100}]

const jail_bar_data = [
  [{x: 'Jail', y: 40}, {x: 'Jail & Homeless', y: 30}],
  [{x: 'Jail', y: 20}, {x: 'Jail & Homeless', y: 30}],
  [{x: 'Jail', y: 30}, {x: 'Jail & Homeless', y: 20}],
  [{x: 'Jail', y: 5}, {x: 'Jail & Homeless', y: 10}],
  [{x: 'Jail', y: 5}, {x: 'Jail & Homeless', y: 10}],
]

const homeless_bar_data = [
  [{x: 'Homeless', y: 20}, {x: 'Jail & Homeless', y: 30}],
  [{x: 'Homeless', y: 15}, {x: 'Jail & Homeless', y: 25}],
  [{x: 'Homeless', y: 25}, {x: 'Jail & Homeless', y: 20}],
  [{x: 'Homeless', y: 30}, {x: 'Jail & Homeless', y: 15}],
  [{x: 'Homeless', y: 10}, {x: 'Jail & Homeless', y: 10}],
]

const table_data = [
  { ID: 12319,
    Name: 'Roy Batty',
    Source: ['Jail', 'Homeless'],
    'Total Counts': 5,
    '# of Jail Days': 8,
    '# of Jail Counts': 3,
    '# of Homeless Days': 2,
    '# of Homeless Counts': 2,
    'Last Jail Encounter': '1982-06-25',
    'Last Homeless Encounter': '1981-06-25' },
  { ID: 17144,
    Name: 'James Moriarty',
    Source: ['Jail', 'Homeless'],
    'Total Counts': 8,
    '# of Jail Days': 16,
    '# of Jail Counts': 5,
    '# of Homeless Days': 2,
    '# of Homeless Counts': 3,
    'Last Jail Encounter': '2017-08-21',
    'Last Homeless Encounter': '1982-06-25' },
  { ID: 12432,
    Name: 'Jason Smith',
    Source: 'Homeless',
    'Total Counts': 1,
    '# of Jail Days': 0,
    '# of Jail Counts': 0,
    '# of Homeless Days': 1,
    '# of Homeless Counts': 2,
    'Last Jail Encounter': null,
    'Last Homeless Encounter': '2017-07-25' },
  { ID: 19332,
    Name: 'H. H. Holmes',
    Source: 'Jail',
    'Total Counts': 1,
    '# of Jail Days': 241,
    '# of Jail Counts': 1,
    '# of Homeless Days': 0,
    '# of Homeless Counts': 0,
    'Last Jail Encounter': '1894-11-17',
    'Last Homeless Encounter': null },
  { ID: 19032,
    Name: 'Jack Ripper',
    Source: 'Jail',
    'Total Counts': 2,
    '# of Jail Days': 102,
    '# of Jail Counts': 2,
    '# of Homeless Days': 0,
    '# of Homeless Counts': 0,
    'Last Jail Encounter': '1891-10-17',
    'Last Homeless Encounter': null },
  { ID: 12143,
    Name: 'Lee Salminen',
    Source: 'Homeless',
    'Total Counts': 5,
    '# of Jail Days': 0,
    '# of Jail Counts': 0,
    '# of Homeless Days': 43,
    '# of Homeless Counts': 5,
    'Last Jail Encounter': null,
    'Last Homeless Encounter': '2017-09-25' },
  { ID: 12833,
    Name: 'John Doe',
    Source: ['Jail', 'Homeless'],
    'Total Counts': 3,
    '# of Jail Days': 2,
    '# of Jail Counts': 1,
    '# of Homeless Days': 8,
    '# of Homeless Counts': 2,
    'Last Jail Encounter': '2017-05-17',
    'Last Homeless Encounter': '2016-04-25' },
  { ID: 13833,
    Name: 'Jane Doe',
    Source: 'Homeless',
    'Total Counts': 2,
    '# of Jail Days': 0,
    '# of Jail Counts': 0,
    '# of Homeless Days': 2,
    '# of Homeless Counts': 2,
    'Last Jail Encounter': null,
    'Last Homeless Encounter': '2017-10-03' },
  { ID: 13932,
    Name: 'Evan Jackson',
    Source: ['Jail', 'Homeless'],
    'Total Counts': 2,
    '# of Jail Days': 1,
    '# of Jail Counts': 1,
    '# of Homeless Days': 4,
    '# of Homeless Counts': 1,
    'Last Jail Encounter': '2017-09-11',
    'Last Homeless Encounter': '2013-02-19' },
  { ID: 19982,
    Name: 'Liam Smith',
    Source: 'Homeless',
    'Total Counts': 3,
    '# of Jail Days': 0,
    '# of Jail Counts': 0,
    '# of Homeless Days': 7,
    '# of Homeless Counts': 3,
    'Last Jail Encounter': null,
    'Last Homeless Encounter': '2011-04-15' },
  { ID: 19932,
    Name: 'Griffin Smith',
    Source: 'Homeless',
    'Total Counts': 2,
    '# of Jail Days': 0,
    '# of Jail Counts': 0,
    '# of Homeless Days': 3,
    '# of Homeless Counts': 2,
    'Last Jail Encounter': null,
    'Last Homeless Encounter': '2017-08-19' },
]

const styles = {
  hr: {
    clear: "both",
  },
  h3: {
    "text-align": "left",
    float:"left",
    "margin-top": 10.5,
  },
  h5: {
    "text-align": "right",
    float:"right",
  },
  page: {
    margin: '10px',
    'font-family': 'Roboto, sans-serif',
  },
  container: {
    display: 'flex',
    'justify-content': 'space-between',
  },
  venn: {
    width: '40%',
  },
  card: {
    width: '300%',
    expanded: true,
  },
  bar_chart: {
    width: '70%',
  },
  list: {
    'text-align': 'center',
  },
  button: {
    margin: '12',
  }
}

function mapStateToProps(state) {
  return {
    vennDiagramData: state.app.vennDiagramData,
    tableData: state.app.tableData,
    jailBarData: state.app.jailBarData,
    homelessBarData: state.app.homelessBarData,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    updateVennDiagramData: (data) => {
      dispatch(getVennDiagramData(data))
    },
    updateTableData: (data) => {
      dispatch(getTableData(data))
    },
    updateJailBarData: (data) => {
      dispatch(getJailBarData(data))
    },
    updateHomelessBarData: (data) => {
      dispatch(getHomelessBarData(data))
    },
  }
}

class Charts extends React.Component {
  componentDidMount() {
    this.props.updateTableData(table_data)
    this.props.updateJailBarData(jail_bar_data)
    this.props.updateHomelessBarData(homeless_bar_data)
    this.props.updateVennDiagramData(venn_diagram_data)
  }

  render() {
    return (
      <div>
        <Header location={this.props.location} />
        <div style={styles.page}>
          <div>
            <h3 style={styles.h3}>Charts - 7/1/2017 through 7/31/2017</h3>
            <h5 style={styles.h5}>
                Total: <strong>740</strong>&nbsp;
                Jail: <strong>500</strong>&nbsp;
                Homeless: <strong>340</strong>&nbsp;
                Intersection: <strong>100</strong>&nbsp;
            </h5>
            <hr style={styles.hr}/>
          </div>
          <div style={styles.container}>
             <Card style={styles.card}>
              <div style={styles.list}>
              </div>
              <TableList data={this.props.tableData} />
            </Card>
          </div>
          <div style={styles.container}>
            <Card style={styles.venn}>
              <CardTitle title="Venn Diagram" titleStyle={{'font-size': 20}} />
              <Venn data={this.props.vennDiagramData} />
            </Card>
            <Card style={styles.bar_chart}>
              <CardTitle title="Jail Duration Bar Chart" titleStyle={{'font-size': 20}} />
              <DurationBarChart data={this.props.jailBarData} title='Jail Days' />
            </Card>
            <Card style={styles.bar_chart}>
              <CardTitle title="Homeless Duration Bar Chart" titleStyle={{'font-size': 20}} />
              <DurationBarChart data={this.props.homelessBarData} title='Homeless Days' />
            </Card>
          </div>
          <RaisedButton label="Download List" secondary={true} style={styles.button} />
          <RaisedButton label="Download Charts" secondary={true} style={styles.button} />
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Charts)