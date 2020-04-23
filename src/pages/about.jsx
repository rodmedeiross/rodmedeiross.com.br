import React from 'react'
import Layout from "../components/Layout"

import CardV2 from '../components/CardV2'

const About = () => {
  const text = 'meu texto'

  return(
    <Layout>
      <div className="container">
        <div className="row">
          <div className="col-12 py-4">
            <h1>About</h1>
            <p>{text}</p>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-4">
            <CardV2
            titleCard="Card Title 01"
            textCard="texttexttexttexttextvtexttexttexttexttexttext"
            colorButton="gatsby"
            backgroundCard="#e3a617"
            styleDefault={true}
            />
          </div>
          <div className="col-4">
            <CardV2
            titleCard="Card Title 02"
            textCard="texttexttexttexttexttexttexttexttexttexttexttext"
            colorButton="warning"
            backgroundCard=""
            styleDefault={false}
            />
          </div>
          <div className="col-4">
            <CardV2
            titleCard="Card Title 03"
            textCard="texttexttexttexttexttexttexttexttexttexttexttext"
            colorButton="gatsby"
            backgroundCard="#fff"
            styleDefault={true}
            />
          </div>
        </div>
      </div>
    </Layout>
  )
}


export default About