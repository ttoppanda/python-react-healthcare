import React from "react";
import * as Survey from "survey-react";
import "survey-react/survey.css";
import { surveyJson } from "./CreateSurveyJSON.js";
import Images from "./assets";
import { CONTENT } from "./SurveyContent.js";

//preload images on page load to prevent flickering later - global array to keep them in memory
let ImageArray = [];
Object.keys(Images).forEach((key) => {
  Object.keys(Images[key]).forEach((subkey) => {
    const img = new Image();
    img.src = Images[key][subkey].default;
    ImageArray.push(img);
  });
});

const EXAMPLE_OUTPUT_IMAGE = require("./assets/base_image.png").default;
const RESULT_URL = process.env.SERVER_URL + "/result";

Survey.StylesManager.applyTheme("default");
Survey.surveyLocalization.locales[
  Survey.surveyLocalization.defaultLocale
].requiredError = "This answer is required.";

function onValueChanged(sender, options) {
  let question_class = class_regex.exec(options.question.name)[0];

  if (Survey.data[question_class]) {
    Survey.data[question_class][options.name] = options.value;
  } else {
    Survey.data[question_class] = {};
    Survey.data[question_class][options.name] = options.value;
  }
}

function onComplete() {
  fetch(RESULT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(Survey.data),
  })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

//setup the survey data
Survey.data = {};
let class_regex = /^(.*?)\_/;

export function SurveyPage() {
  let model = new Survey.Model(surveyJson);
  Survey.data["id"] = Date.now();
  model.showProgressBar = "bottom";
  model.showQuestionNumbers = "off";
  model.onAfterRenderQuestion.add(function (sender, options) {
    if (options.question.name === "displayExample") {
      let img = options.htmlElement.getElementsByTagName("img")[0];

      //toggle both the image and the button text onclick
      img.src = options.question.imageLink;
      options.htmlElement.onclick = function () {
        img.src =
          img.src == EXAMPLE_OUTPUT_IMAGE
            ? options.question.imageLink
            : EXAMPLE_OUTPUT_IMAGE;

        let button = options.htmlElement.getElementsByTagName("button")[0];
        button.innerHTML =
          button.innerHTML == "Hide explanation"
            ? "Show explanation"
            : "Hide explanation";
      };

      createPrettyButton(options);
    }
  });
  return (
    <div className="container">
      <Survey.Survey
        model={model}
        onComplete={onComplete}
        onValueChanged={onValueChanged}
        completedHtml={CONTENT.completedHtml}
      />
    </div>
  );
}

function createPrettyButton(options) {
  var btn = document.createElement("button");
  btn.innerHTML = "Hide explanation";

  btn.style.setProperty("margin-top", "10px");

  var header = options.htmlElement.firstChild;
  var span = document.createElement("span");
  span.innerHTML = "  ";
  header.appendChild(span);
  header.appendChild(btn);
}
