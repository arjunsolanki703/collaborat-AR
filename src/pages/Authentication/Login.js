import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import PropTypes from "prop-types";

import axios from "axios";
import styled from "styled-components";
import { gapi } from "gapi-script";
import GoogleDriveImage from "../../assets/images/google-drive.png";
import ListDocuments from "../ListDocuments";
import { style } from "./styles";

//from this project

import { Alert, Card, CardBody, Col, Container, Label, Row } from "reactstrap";
// Redux
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { apiError, loginUser, socialLogin } from "../../store/actions";
// import images
import profile from "../../assets/images/profile-img.png";
import logo from "../../assets/images/logo.svg";
import lightlogo from "../../assets/images/logo-light.svg";

const NewDocumentWrapper = styled.div`
  ${style}
`;

// Client ID and API key from the Developer Console
// const CLIENT_ID = '1087902307093-l68ij0lcqo2b273jc046n84aiulbhsvl.apps.googleusercontent.com';
// const API_KEY = 'AIzaSyCV_Yde-S0eG46MOYghKwXc6MHr5e5ISgk';

const CLIENT_ID =
  "928121316668-4cc7a847139ms3aufh976get189jbrqa.apps.googleusercontent.com";
const API_KEY = "AIzaSyCxeTVxW3GTkhYf1xkFrgL823qN2jlna4E";

// Array of API discovery doc URLs for APIs
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/drive";

const Login = (props) => {
  const [listDocumentsVisible, setListDocumentsVisibility] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [isLoadingGoogleDriveApi, setIsLoadingGoogleDriveApi] = useState(false);
  const [isFetchingGoogleDriveFiles, setIsFetchingGoogleDriveFiles] =
    useState(false);
  const [signedInUser, setSignedInUser] = useState();

  const [responseData, setResponseData] = useState("");
  const [displayError, setDisplayError] = useState(false);
  const [signInBtnPressed, setsignInBtnPressed] = useState(false);
  // const handleChange = (file) => { };

  useEffect(() => {
    // Update the document title using the browser API

    sessionStorage.clear();
    localStorage.clear();
  }, []);

  /**
   * Print files.
   */
  const listFiles = (searchTerm = null) => {
    // console.log('listfile');
    setIsFetchingGoogleDriveFiles(true);
    gapi.client.drive.files
      .list({
        pageSize: 20,
        fields: "nextPageToken, files(id, name, mimeType, modifiedTime)",
        q: searchTerm,
      })
      .then(function (response) {
        setIsFetchingGoogleDriveFiles(false);
        setListDocumentsVisibility(true);
        const res = JSON.parse(response.body);

        setDocuments(res.files);
      });
  };

  /**
   *  Sign in the user upon button click.
   */
  const handleAuthClick = (event) => {
    gapi.auth2.getAuthInstance().signIn();
  };

  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  const updateSigninStatus = async (isSignedIn) => {
    // console.log(isSignedIn);
    if (isSignedIn) {
      //   console.warn(gapi.auth2.getAuthInstance().currentUser.le.xc.id_token);
      const { socialLogin } = props;
      const postData = {
        name: gapi.auth2.getAuthInstance().currentUser.le.wt.Ad,
        email: gapi.auth2.getAuthInstance().currentUser.le.wt.cu,
        token: gapi.auth2.getAuthInstance().currentUser.le.xc.access_token,
        idToken: gapi.auth2.getAuthInstance().currentUser.le.xc.id_token,
      };
      //   console.log(postData);
      const checkData = {
        email: gapi.auth2.getAuthInstance().currentUser.le.wt.cu,
        access_token:
          gapi.auth2.getAuthInstance().currentUser.le.xc.access_token,
      };
      // console.log(checkData);

      const result = await axios
        .post("https://admin.collaboratar.com/public/api/login", checkData)
        .then((response) => {
          return response && response.data && response.data.status;
        })
        .catch((error) => {
          // this.setState({ errorMessage: error.message });
          console.error("There was an error!", error);
        });

      // console.log(result);
      if (result === "success") {
        socialLogin(postData, props.history, "google");
      } else {
        setResponseData("You Are Not Allowed to Enter");
        setDisplayError(true);
      }

      //socialLogin(postData, props.history, 'google');

      // // Set the signed in user
      setSignedInUser(gapi.auth2.getAuthInstance().currentUser.le.wt);
      // setIsLoadingGoogleDriveApi(false);
      // list files if user is authenticated
      // listFiles();
    } else {
      // prompt user to sign in
      if(signInBtnPressed){
        console.log('Trying to sign in from login component.')
        setsignInBtnPressed(false);
        handleAuthClick();
        
      }
    }
  };

  /**
   *  Sign out the user upon button click.
   */
  const handleSignOutClick = (event) => {
    setListDocumentsVisibility(false);
    gapi.auth2.getAuthInstance().signOut();
  };

  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
  const initClient = () => {
    setIsLoadingGoogleDriveApi(true);
    gapi.client
      .init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      })
      .then(
        function () {
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

          // Handle the initial sign-in state.
          updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        },
        function (error) {}
      );
  };

  const handleClientLoad = () => {
    console.log('handleClientLoad from login click');
    setsignInBtnPressed(true);
    gapi.load("client:auth2", initClient);
  };

  const showDocuments = () => {
    setListDocumentsVisibility(true);
  };

  const onClose = () => {
    setListDocumentsVisibility(false);
  };

  return (
    <React.Fragment>
      {/* <div className="home-btn d-none d-sm-block">
        <Link to="/" className="text-dark">
          <i className="bx bx-home h2" />
        </Link>
      </div> */}
      <div className="account-pages my-5 pt-sm-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              {displayError === true ? (
                <Alert color="danger">{responseData}</Alert>
              ) : (
                <i className="bx font-size-24 text-warning"></i>
              )}
              <Card className="overflow-hidden">
                <div className="bg-primary bg-soft">
                  <Row>
                    <Col className="col-7">
                      <div className="text-primary p-4">
                        <h5 className="text-primary">Welcome Back !</h5>
                        <p>Sign in to continue</p>
                      </div>
                    </Col>
                    <Col className="col-5 align-self-end">
                      <img src={profile} alt="" className="img-fluid" />
                    </Col>
                  </Row>
                </div>

                <CardBody className="pt-0">
                  <div className="auth-logo">
                    <Link to="/" className="auth-logo-light">
                      <div className="avatar-md profile-user-wid mb-4">
                        <span className="avatar-title rounded-circle bg-light">
                          <img
                            src={lightlogo}
                            alt=""
                            className="rounded-circle"
                            height="34"
                          />
                        </span>
                      </div>
                    </Link>
                    <Link to="/" className="auth-logo-dark">
                      <div className="avatar-md profile-user-wid mb-4">
                        <span className="avatar-title rounded-circle bg-light">
                          <img
                            src={logo}
                            alt=""
                            className="rounded-circle"
                            height="34"
                          />
                        </span>
                      </div>
                    </Link>
                  </div>
                  <p>
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                    Ipsam officia repellendus maiores. Eveniet et perspiciatis
                    voluptate, porro expedita aut ipsam sint ad aliquam, ducimus
                    enim sapiente molestiae inventore cumque facere.
                  </p>
                  <div className="p-2">
                    {/* <Formik enableReinitialize={true}> */}
                    <Formik enableReinitialize={false}>
                      {({ errors, status, touched }) => (
                        <Form className="form-horizontal">
                          <div className=" text-center">
                            <h2 className="font-size-24 mb-3">
                              Continue with Google
                            </h2>

                            <ul className="list-inline">
                              <Spin
                                spinning={isLoadingGoogleDriveApi}
                                style={{ width: "100%" }}
                              >
                                <div
                                  onClick={() => handleClientLoad()}
                                  className="source-container"
                                >
                                  <button
                                    type="button"
                                    style={{
                                      background: "none",
                                      border: "none",
                                    }}
                                  >
                                    <div className="icon-container">
                                      <div className="icon icon-success">
                                        <img
                                          width="250"
                                          src={GoogleDriveImage}
                                        />
                                      </div>
                                    </div>
                                  </button>
                                  {/*<div className="content-container">*/}
                                  {/*    <p className="title">Google Drive</p>*/}
                                  {/*    <span className="content">Import documents straight from your google drive</span>*/}
                                  {/*</div>*/}
                                </div>
                              </Spin>
                            </ul>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/*<Row gutter={16} className="custom-row">*/}
      {/*    <ListDocuments*/}
      {/*        visible={listDocumentsVisible}*/}
      {/*        onClose={onClose}*/}
      {/*        documents={documents}*/}
      {/*        onSearch={listFiles}*/}
      {/*        signedInUser={signedInUser}*/}
      {/*        onSignOut={handleSignOutClick}*/}
      {/*        isLoading={isFetchingGoogleDriveFiles}*/}
      {/*    />*/}
      {/*    <Col span={8}>*/}

      {/*    </Col>*/}
      {/*</Row>*/}
    </React.Fragment>
  );
};

Login.propTypes = {
  apiError: PropTypes.any,
  error: PropTypes.any,
  history: PropTypes.object,
  loginUser: PropTypes.func,
  socialLogin: PropTypes.func,
};

const mapStateToProps = (state) => {
  const { error } = state.Login;
  return { error };
};

export default withRouter(
  connect(mapStateToProps, { loginUser, apiError, socialLogin })(Login)
);
