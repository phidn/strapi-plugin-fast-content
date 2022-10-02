import styled from "styled-components";

const TableWrapper = styled.div`
  max-height: 800px;
  overflow-y: scroll;
  
  table {
    thead {
      tr {
        th {
          div {
            span {
              text-transform: unset;
            }
          }
        }
      }
    }
    tbody {
      tr {
        td {
          max-width: 300px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          &.td-field-name {
            input {
              width: unset;
            }
          }
          &.border-right {
            padding-right: 20px;
            border-right: 1px solid #eaeaef;
          }
          &.tr-td-actions {
            button {
              margin-right: 5px;
            }
          }
          &.tr-td-select {
            svg {
              height: 100%;
            }
          }
        }
      }
    }
  }
`;

export { TableWrapper };
