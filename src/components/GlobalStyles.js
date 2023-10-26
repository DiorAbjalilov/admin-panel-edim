import { createGlobalStyle } from 'styled-components'

export default createGlobalStyle`
    body {
        margin: 0;
        padding: 0;
        background-color: whitesmoke;
    }
    .row-dragging {
        background: #fafafa;
        border: 1px solid #ccc;
    }

    .row-dragging td {
        padding: 16px;
    }

    .row-dragging .drag-visible {
        visibility: visible;
    }
`