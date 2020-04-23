import React from 'react'
import Layout from "../components/Layout"

import * as Styled from '../styles/pages/contactStyles'

const Contact = () => {
  const text = 'meu texto contato'

  return(
    <Layout>
      <div className="container">
        <div className="row">
          <div className="col-12 py-4">
            <h1>Contact</h1>
            <p>{text}</p>
          </div>
          <div className="col-6">
          <ul class="list-group">
            <li class="list-group-item">
              <Styled.EmailWrapper danger
              />Email
            </li>
            {/* <li class="list-group-item"><Icons.Telephone className="w-25 text-success"/>Telefone</li>
            <li class="list-group-item"><Icons.LocationOn className="w-25 text-danger"/>Localização</li> */}
          </ul>
          </div>
        </div>
      </div>
    </Layout>
  )
}


export default Contact