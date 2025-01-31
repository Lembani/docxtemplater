const loopModule = require("./modules/loop.js");
const spacePreserveModule = require("./modules/space-preserve.js");
const rawXmlModule = require("./modules/rawxml.js");
const expandPairTrait = require("./modules/expand-pair-trait.js");
const render = require("./modules/render.js");

function PptXFileTypeConfig() {
	return {
		getTemplatedFiles(zip) {
			const slideTemplates = zip
				.file(/ppt\/(slideMasters)\/(slideMaster)\d+\.xml/)
				.map(function (file) {
					return file.name;
				});
			return slideTemplates.concat([
				"ppt/presentation.xml",
				"docProps/app.xml",
				"docProps/core.xml",
			]);
		},
		textPath() {
			return "ppt/slides/slide1.xml";
		},
		tagsXmlTextArray: [
			"Company",
			"HyperlinkBase",
			"Manager",
			"cp:category",
			"cp:keywords",
			"dc:creator",
			"dc:description",
			"dc:subject",
			"dc:title",

			"a:t",
			"m:t",
			"vt:lpstr",
		],
		tagsXmlLexedArray: [
			"p:sp",
			"a:tc",
			"a:tr",
			"a:table",
			"a:p",
			"a:r",
			"a:rPr",
			"p:txBody",
			"a:txBody",
		],
		expandTags: [{ contains: "a:tc", expand: "a:tr" }],
		onParagraphLoop: [{ contains: "a:p", expand: "a:p", onlyTextInTag: true }],
		tagRawXml: "p:sp",
		baseModules: [loopModule, expandPairTrait, rawXmlModule, render],
		tagShouldContain: [
			{ tag: "p:txBody", shouldContain: ["a:p"], value: "<a:p></a:p>" },
			{ tag: "a:txBody", shouldContain: ["a:p"], value: "<a:p></a:p>" },
		],
	};
}

function DocXFileTypeConfig() {
	return {
		getTemplatedFiles(zip) {
			const baseTags = [
				"docProps/core.xml",
				"docProps/app.xml",
				"word/settings.xml",
			];
			const headerFooters = zip
				.file(/word\/(header|footer)\d+\.xml/)
				.map(function (file) {
					return file.name;
				});
			return headerFooters.concat(baseTags);
		},
		textPath(doc) {
			return doc.targets[0];
		},
		tagsXmlTextArray: [
			"Company",
			"HyperlinkBase",
			"Manager",
			"cp:category",
			"cp:keywords",
			"dc:creator",
			"dc:description",
			"dc:subject",
			"dc:title",

			"w:t",
			"m:t",
			"vt:lpstr",
		],
		tagsXmlLexedArray: [
			"w:proofState",
			"w:tc",
			"w:tr",
			"w:table",
			"w:p",
			"w:r",
			"w:br",
			"w:rPr",
			"w:pPr",
			"w:spacing",
			"w:sdtContent",
			"w:drawing",

			"w:sectPr",
			"w:type",
			"w:headerReference",
			"w:footerReference",
		],
		expandTags: [{ contains: "w:tc", expand: "w:tr" }],
		onParagraphLoop: [{ contains: "w:p", expand: "w:p", onlyTextInTag: true }],
		tagRawXml: "w:p",
		baseModules: [
			loopModule,
			spacePreserveModule,
			expandPairTrait,
			rawXmlModule,
			render,
		],
		tagShouldContain: [
			{ tag: "w:tc", shouldContain: ["w:p"], value: "<w:p></w:p>" },
			{
				tag: "w:sdtContent",
				shouldContain: ["w:p", "w:r"],
				value: "<w:p></w:p>",
			},
		],
	};
}

module.exports = {
	docx: DocXFileTypeConfig,
	pptx: PptXFileTypeConfig,
};
