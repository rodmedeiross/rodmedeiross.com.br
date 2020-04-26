import React from 'react'
import Layout from "../components/Layout"
import CardV2 from '../components/CardV2'
import SEO from "../components/seo"

const About = () => {
  const text = 'meu texto'

  return(
    <Layout>
      <SEO 
        title="About"
        lang="en"
        description="About me!"
      />
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
          <div className="col-lg-4 mb-3">
            <CardV2
            nameImage="foto01"
            titleCard="Card Title 01"
            textCard="texttexttexttexttextvtexttexttexttsdsexttexttext"
            colorButton="gatsby"
            backgroundCard=""
            styleDefault={true}
            />
          </div>
          <div className="col-lg-4 mb-3">
            <CardV2
            nameImage="foto02"
            titleCard="Card Title 02"
            textCard="texttexttexttexttexttexttexttexttexttexttexttext"
            colorButton="warning"
            backgroundCard=""
            styleDefault={false}
            />
          </div>
          <div className="col-lg-4 mb-3">
            <CardV2
            nameImage="foto03"
            titleCard="Card Title 03"
            textCard="texttexttexttexttexttexttexttexttexttexttexttext"
            colorButton="gatsby"
            backgroundCard=""
            styleDefault={true}
            />
          </div>
        </div>
      </div>
    </Layout>
  )
}


export default About