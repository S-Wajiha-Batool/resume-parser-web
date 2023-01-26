import React from "react";
import { Container, Row, Col, Modal, Button, FormGroup } from 'react-bootstrap'
var FormData = require('form-data');

function UploadJd() {
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

            <Row><label className='mainLabel'><FaListUl/>Category</label>
              <Row>
                <label className='subLabel'>Main Category</label>
                <select className="form-select" placeholder="Main Category" value={cat.selectedMainCat} required onChange={changeMainCategory}>
                  <option className='option' value=''>-Select Main Category-</option>
                  {cat.mainCat.map((c, key) => {
                    return <option className='option' key={key} value={c.name}>{c.name}</option>;
                  })}
                </select>
              </Row>
              <Row>
                <label className='subLabel'>Sub Category</label>
                <select className="form-select" placeholder="Sub Category" value={cat.selectedSubCat} required onChange={changeSubCategory}>
                  <option className='option' value=''>Select Sub Category</option>
                  {cat.subCat.map((c, key) => {
                    return <option className='option' key={key} value={c.name}>{c.name}</option>;
                  })}
                </select>
              </Row>
              <Row>
                <label className='subLabel'>Category Types</label>
                <select className="form-select" placeholder="Category Type" value={cat.selectedSubSubCat} required onChange={changeSubSubCategory}>
                  <option className='option' value='' >Select Category Type</option>
                  {cat.subSubCat.map((c, key) => {
                    return <option className='option' key={key} value={c.name}>{c.name}</option>;
                  })}
                </select>
              </Row>
            </Row>

            <Row>
              <label className='mainLabel'><MdLocationOn />Location</label>

              <Row>
                <label className='subLabel'>Area</label>
                <textarea type='text'
                  rows='3'
                  placeholder=''
                  name='area'
                  value={ad.area}
                  required
                  onChange={onChangeInput}
                  className='form-control form-group' />
              </Row>
              <Row>
                <Col>
                  <div className="form-group">
                    <label style={{ marginTop: 5, marginBottom: 5, fontWeight: 500 }}>Province</label>
                    <select className="form-select" placeholder="Province" value={location.selectedProvince} required onChange={changeProvince}>
                      <option className='option' value=''>All</option>
                      {location.provinces.map((c, key) => {
                        return <option className='option' key={key} value={c.name}>{c.name}</option>;
                      })}
                    </select>
                  </div>
                </Col>
                <Col>
                  <div className="form-group">
                    <label style={{ marginTop: 5, marginBottom: 5, fontWeight: 500 }}>City</label>
                    <select className="form-select" placeholder="City" value={location.selectedCity} required onChange={changeCity}>
                      <option className='option' value=''>All</option>
                      {location.cities.map((e, key) => {
                        return <option className='option' key={key} value={e.name}>{e.name}</option>;
                      })}
                    </select>
                  </div>
                </Col>
              </Row>
            </Row>
            <Row>
              <label className='mainLabel'><IoIosImage />  Images</label>

              <Row>
                <label className='subLabel'>Cover Image</label>
              
                <input className='file_up' type='file' name='file1' required accept='image/*' onChange={handleChangeSingle("file1")}></input>
                <div className='img'>
                  {onEdit} {!(ad.file1) ? (<div><a><img style ={{height:'150px', width: '150px'}} src ={images[0].url} alt =''/></a></div>) : null}
                  
                  </div>
              </Row>
              <Row>
                <label className='subLabel'>Additional Images</label>
                <input type='file'  name='file2' multiple accept='image/*' onChange={handleChangeMultiple("file2")}></input>
                <div className='img'>
                  {onEdit} {!(ad.file2) ? (showaAddImages()) : null}

                   
                  </div>
              </Row>
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
