import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, FormGroup } from 'react-bootstrap'
var FormData = require('form-data');

function UploadJd() {

    const [jd, setJd] = useState({position: "", department: "", file: ""})

    const departments = ["HR", "IT", "Finance", "Marketing", "Software Engineering"]

    const handleChangeSingle = (name) => (e) => {
        const value = e.target.files;
        setJd({ ...jd, [name]: value });
    };

    const onChangeInput = e => {
        const { name, value } = e.target;
        setJd({ ...jd, [name]: value })
    }


    return (
        <div>
            <div className="title">Post Job Description</div>
            <Container >
                <form onSubmit={handleSubmit}>
                    <Col md={{ span: 8, offset: 2 }}>

                        <Row>
                            <label className='mainLabel'>Title</label>
                            <Row>
                                <input type='text'
                                    placeholder='Title'
                                    name='title'
                                    value={ad.price}
                                    required
                                    onChange={onChangeInput}
                                    className='form-control form-group' />
                            </Row>
                        </Row>

                        <Row>
                            <label className='mainLabel'><MdLocationOn />Department</label>
                            <div className="form-group">
                                <select className="form-select" placeholder="Department" value={jd.department} required onChange={onChangeInput}>
                                    <option className='option' value=''>HR</option>
                                    {departments.map((d, key) => {
                                        return <option className='option' key={key} value={d}>{d}</option>;
                                    })}
                                </select>
                            </div>

                        </Row>
                        <Row>
                            <label className='mainLabel'> File</label>
                            <div className=''>FileName</div>
                            <input className='file_up' type='file' name='file1' required accept='image/*' onChange={handleChange()}></input>
                        </Row>


                        <hr
                            style={{
                                backgroundColor: 'dimgrey',
                                height: 3,
                                margin: '30px 0'
                            }}
                        />

                        <div className='checkout'>
                            <button className='checkout_button'>
                                <span>Post Advertisement</span>
                            </button>
                        </div>
                    </Col>
                </form>
            </Container>
        </div>
    )
}

export default UploadJd
