import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import escapeStringRegexp from 'escape-string-regexp';
import srcDoc from 'srcdoc-polyfill';

class PreviewFrame extends React.Component {

  componentDidMount() {
    if (this.props.isPlaying) {
      this.renderFrameContents();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isPlaying !== prevProps.isPlaying) {
      this.renderSketch();
    }

    if (this.props.isPlaying && this.props.content !== prevProps.content) {
      this.renderSketch();
    }
  }

  componentWillUnmount() {
    ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(this).contentDocument.body);
  }

  clearPreview() {
    const doc = ReactDOM.findDOMNode(this);
    doc.srcDoc = '';
  }

  injectLocalFiles() {
    let htmlFile = this.props.htmlFile.content;

    this.props.jsFiles.forEach(jsFile => {
      const fileName = escapeStringRegexp(jsFile.name);
      const fileRegex = new RegExp(`<script.*?src=('|")((\.\/)|\/)?${fileName}('|").*?>([\s\S]*?)<\/script>`, 'gmi');
      htmlFile = htmlFile.replace(fileRegex, `<script>\n${jsFile.content}\n</script>`);
    });

    this.props.cssFiles.forEach(cssFile => {
      const fileName = escapeStringRegexp(cssFile.name);
      const fileRegex = new RegExp(`<link.*?href=('|")((\.\/)|\/)?${fileName}('|").*?>`, 'gmi');
      htmlFile = htmlFile.replace(fileRegex, `<style>\n${cssFile.content}\n</style>`);
    });

    // const htmlHead = htmlFile.match(/(?:<head.*?>)([\s\S]*?)(?:<\/head>)/gmi);
    // const headRegex = new RegExp('head', 'i');
    // let htmlHeadContents = htmlHead[0].split(headRegex)[1];
    // htmlHeadContents = htmlHeadContents.slice(1, htmlHeadContents.length - 2);
    // htmlHeadContents += '<link rel="stylesheet" type="text/css" href="/preview-styles.css" />\n';
    // htmlFile = htmlFile.replace(/(?:<head.*?>)([\s\S]*?)(?:<\/head>)/gmi, `<head>\n${htmlHeadContents}\n</head>`);

    return htmlFile;
  }

  renderSketch() {
    const doc = ReactDOM.findDOMNode(this);
    if (this.props.isPlaying) {
      // TODO add polyfill for this
      // doc.srcdoc = this.injectLocalFiles();
      srcDoc.set(doc, this.injectLocalFiles());
    } else {
      // doc.srcdoc = '';
      srcDoc.set(doc, '');
      doc.contentWindow.document.open();
      doc.contentWindow.document.write('');
      doc.contentWindow.document.close();
    }
  }

  renderFrameContents() {
    const doc = ReactDOM.findDOMNode(this).contentDocument;
    if (doc.readyState === 'complete') {
      this.renderSketch();
    } else {
      setTimeout(this.renderFrameContents, 0);
    }
  }

  render() {
    return (
      <iframe
        className="preview-frame"
        frameBorder="0"
        title="sketch output"
        sandbox="allow-scripts allow-pointer-lock allow-same-origin allow-popups allow-modals allow-forms"
      ></iframe>
    );
  }
}

PreviewFrame.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  head: PropTypes.object.isRequired,
  content: PropTypes.string.isRequired,
  htmlFile: PropTypes.shape({
    content: PropTypes.string.isRequired
  }),
  jsFiles: PropTypes.array.isRequired,
  cssFiles: PropTypes.array.isRequired
};

export default PreviewFrame;