import styled, {css} from 'styled-components'
import Icons from "../../components/Icons"

export const EmailWrapper = styled(Icons.Email)`
  color: ${props => props.color ? props.color : '#272C30'};
  width: ${props => props.width ? props.width : '35px'};

  ${ props =>
  props.nullDark &&
    css`
      color: black;
      width: 35px;      
    `
  };
  ${ props =>
  props.danger &&
    css`
      color: red;
      width: 35px;    
    `
  };
`

export const TelephoneWrapper = styled(Icons.Telephone)`
  color: ${props => props.color ? props.color : '#272C30'};
  width: ${props => props.width ? props.width : '35px'};

  ${ props =>
  props.nullDark &&
    css`
      color: black;
      width: 35px;    
    `
  };
  ${ props =>
  props.danger &&
    css`
      color: red;
      width: 35px;    
    `
  };
`

export const LocationOnWrapper = styled(Icons.LocationOn)`
  color: ${props => props.color ? props.color : '#272C30'};
  width: ${props => props.width ? props.width : '35px'};

  ${ props =>
  props.nullDark &&
    css`
      color: black;
      width: 35px;    
    `
  };
  ${ props =>
  props.danger &&
    css`
      color: red;
      width: 35px;    
    `
  };
`