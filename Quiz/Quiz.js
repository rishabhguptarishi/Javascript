class QuestionGenerator {

  constructor() {
    this.firstNumber = null;
    this.secondNumber = null;
    this.answer = null;
    this.operator = null;
  }

  generateRandomNumber() {
    return Math.floor(Math.random() * 20);
  }

  generateRandomOperator() {
    let operators = [{
        sign: "+",
        method: function(a,b){ return a + b; }
    }, {
        sign: "-",
        method: function(a,b){ return a - b; }
    }, {
      sign: "*",
      method: function(a,b){ return a * b; }
    }, {
      sign: "/",
      method: function(a,b){ return a / b; }
    }];

    let selectedOperator = Math.floor(Math.random() * operators.length);
    return operators[selectedOperator];
  }

  generateQuestion() {
    this.firstNumber = this.generateRandomNumber();
    this.secondNumber = this.generateRandomNumber();
    let operator = this.generateRandomOperator();
    this.operator = operator.sign;
    this.answer = operator.method(this.firstNumber, this.secondNumber);
    let question = `${this.firstNumber} ${this.operator} ${this.secondNumber}`
    return {
      question : question,
      answer : parseInt(this.answer),
    }
  }
}

class Timer {

  constructor(time) {
    this.time = time;
    this.$timer = $('#timeremain');
  }

  startTime(nextButton){
    let interval = setInterval(() => {
       this.time -= 1;
       this.$timer.text(this.time);
       if(this.time === 0) {
         nextButton.trigger('click');
       }
    },1000);
    return interval;
  }
}

const typeOfAnswers = {
  unanswered : 0,
  wrong : 0,
  correct : 1,
};

class Quiz {

  constructor(numberOfQuestions) {
    this.score = 0;
    this.questionAnswers = []
    this.$questionElement = $('#qtn');
    this.$userAnswerElement = $('#answerdiv');
    this.$scoreElement = $('#scoreValue');
    this.timer = null;
    this.$nextButton = $('#start');
    this.numberOfQuestions = numberOfQuestions;
  }

  startQuiz(){
    let questionNumber = 0;
    this.$nextButton.bind('click',()=>{
      clearInterval(this.timer);
      if(questionNumber < this.numberOfQuestions) {
        if(questionNumber === 0){
          this.firstQuestion();
        } else{
          this.calculateScore(questionNumber - 1);
        }
        this.$userAnswerElement.val('');
        questionNumber++;
        this.displayQuestion();
        this.timer = this.generateTime();
      } else if(questionNumber === this.numberOfQuestions) {
        this.quizComplete();
        questionNumber++;
      } else {
        location.reload();
      }
    });
  }

  quizComplete(){
    this.displayAnswers();
    this.$nextButton.html('Finish');
  }

  firstQuestion(){
    this.$nextButton.html('Next');
    this.$userAnswerElement.removeAttr('disabled');
  }

  displayQuestion(){
    let questionAndAnswer = this.questionAnswerGenerator();
    this.$questionElement.html(questionAndAnswer.question);
    this.questionAnswers.push(questionAndAnswer);
  }

  questionAnswerGenerator(){
    return new QuestionGenerator().generateQuestion();
  }

  calculateScore(questionNumber){
    this.score += this.evaluateQuestion(questionNumber);
    this.displayScore();
  }

  evaluateQuestion(questionNumber){
    let userAnswer = parseInt(this.$userAnswerElement.val());
    let questionAnswer = this.questionAnswers[questionNumber];
    if(userAnswer === ''){
      questionAnswer.userAnswer = typeOfAnswers.unanswered;
      return typeOfAnswers.unanswered;
    } else {
      if(userAnswer === questionAnswer.answer){
        questionAnswer.userAnswer = typeOfAnswers.correct;
        return typeOfAnswers.correct;
      }
      else {
        questionAnswer.userAnswer = typeOfAnswers.wrong;
        return typeOfAnswers.wrong;
      }
    }
  }

  displayScore(){
    this.$scoreElement.text(this.score);
  }

  generateTime(){
    return new Timer(10).startTime(this.$nextButton);
  }

  displayAnswers(){
    let unanswerWrong = this.questionAnswers.filter(obj => {
      return obj.userAnswer === typeOfAnswers.unanswered || obj.userAnswer === typeOfAnswers.wrong
    });
    let answersOfWrong = unanswerWrong.map((entity) => {return `${entity.question} --> ${entity.answer}`}).join('<br>');
    this.$questionElement.html(answersOfWrong);
    this.$userAnswerElement.remove();
    this.$questionElement.height('260px')
  }
}

$(() => {
  let numberOfQuestions = 20;
  new Quiz(numberOfQuestions).startQuiz();
});
