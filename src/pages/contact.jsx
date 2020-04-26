import React from 'react'
import Layout from "../components/Layout"
import SEO from "../components/seo"

import * as Styled from '../styles/pages/contactStyles'

const Contact = () => {
  const text = 'meu texto contato'

  return(
    <Layout>
      <SEO 
        title="Contact" 
        lang="en"
        description="Contact me now!"
      />
      <div className="container">
        <div className="row">
          <div className="col-12 py-4">
            <h1>Contact</h1>
            <p>{text}</p>
          </div>
          <div className="col-md-6 mb-3">
            <form name="contact" method="post" data-netlify="true">
            <input type="hidden" name="form-name" value="contact" />
              <div className="form-group">
                <input name="name" type="text" className="form-control" id="exampleInputName" placeholder="Name"/>
              </div>
              <div className="form-group">
                <input name="email" type="email" className="form-control" id="exampleInputEmail" placeholder="Email"/>
              </div>
              <div className="form-group">
                <textarea name="message" className="form-control" id="exampleFormControlTextarea" rows="3" placeholder="Textarea"></textarea>
              </div>
              <button type="submit" className="btn btn-success">Send</button>
            </form>
          </div>
          <div className="col-md-6">
            <ul className="list-group">
              <li className="list-group-item">
                <Styled.EmailWrapper danger
                />example@gmail.comm
              </li>
              <li className="list-group-item">
                <Styled.TelephoneWrapper danger
                />+55 51 999999999
              </li>
              <li className="list-group-item">
                <Styled.LocationOnWrapper danger
                />LaStreet 27, 547
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  )
}


export default Contact