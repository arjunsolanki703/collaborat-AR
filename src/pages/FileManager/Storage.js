import React, { Component } from "react"
import PropTypes from 'prop-types';
import { Link } from "react-router-dom"
import { Card, CardBody } from "reactstrap"
import ReactApexChart from "react-apexcharts"

export default class Storage extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  render() {
    return (
      <React.Fragment>
        <Card className="filemanager-sidebar ms-lg-2">
          <CardBody>
            <div className="text-center">
              <h5 className="font-size-15 mb-4">Storage</h5>
              <div className="apex-charts">
                <ReactApexChart
                  options={this.props.filemanager.options}
                  series={this.props.filemanager.series}
                  type="radialBar"
                  height={150}
                />
              </div>

              <p className="text-muted mt-4">{this.props.filemanager && this.props.filemanager.limit} GB (76%) of 64 GB used</p>
            </div>

            <div className="mt-4">



              <div className="card border shadow-none mb-2">
                <Link to="#" className="text-body">
                  <div className="p-2">
                    <div className="d-flex">
                      <div className="avatar-xs align-self-center me-2">
                        <div className="avatar-title rounded bg-transparent text-primary font-size-20">
                          <i className="mdi mdi-file-document"></i>
                        </div>
                      </div>

                      <div className="overflow-hidden me-auto">
                        <h5 className="font-size-13 text-truncate mb-1">
                          Document
                        </h5>
                        <p className="text-muted text-truncate mb-0">
                          21 Files
                        </p>
                      </div>

                      <div className="ml-2">
                        <p className="text-muted">2 GB</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="card border shadow-none">
                <Link to="#" className="text-body">
                  <div className="p-2">
                    <div className="d-flex">
                      <div className="avatar-xs align-self-center me-2">
                        <div className="avatar-title rounded bg-transparent text-warning font-size-20">
                          <i className="mdi mdi-folder"></i>
                        </div>
                      </div>

                      <div className="overflow-hidden me-auto">
                        <h5 className="font-size-13 text-truncate mb-1">
                          Others
                        </h5>
                        <p className="text-muted text-truncate mb-0">
                          20 Files
                        </p>
                      </div>

                      <div className="ml-2">
                        <p className="text-muted">1.4 GB</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>
      </React.Fragment>
    )
  }
}

Storage.propTypes = {
  filemanager: PropTypes.any
}
