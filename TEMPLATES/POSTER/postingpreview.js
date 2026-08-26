<script type="text/javascript">
(function () {
  "use strict";

  function initializeLitsoTopicReviewSubjects() {
    var subjects = document.querySelectorAll(
      "[data-litso-topicreview_subject]"
    );

    if (!subjects.length) {
      return;
    }

    var sharedSubject = "";

    Array.prototype.some.call(subjects, function (subject) {
      var textElement = subject.querySelector(
        ".litso-topicreview_subjectText"
      );

      if (!textElement) {
        return false;
      }

      var value = textElement.textContent
        .replace(/\s+/g, " ")
        .trim();

      if (!value) {
        return false;
      }

      sharedSubject = value;
      return true;
    });

    if (!sharedSubject) {
      return;
    }

    Array.prototype.forEach.call(subjects, function (subject) {
      var textElement = subject.querySelector(
        ".litso-topicreview_subjectText"
      );

      if (!textElement) {
        return;
      }

      var currentSubject = textElement.textContent
        .replace(/\s+/g, " ")
        .trim();

      if (!currentSubject) {
        textElement.textContent = sharedSubject;
        currentSubject = sharedSubject;
      }

      subject.setAttribute(
        "data-ghost",
        currentSubject
      );
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeLitsoTopicReviewSubjects,
      { once: true }
    );
  } else {
    initializeLitsoTopicReviewSubjects();
  }
})();
</script>
