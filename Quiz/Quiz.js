class MathUtility{

  constructor(minimumNumber, maximumNumber){
    this.maximumNumber = maximumNumber;
    this.minimumNumber = minimumNumber;
  }

  generateRandomNumber() {
    return Math.floor((Math.random() * this.maximumNumber) + this.minimumNumber);
  }

  getOperators(){
    return [{
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
      method: function(a,b){ return parseInt(a / b); }
    }];
  }
}

class Question {

  constructor() {
    this.firstNumber = null;
    this.secondNumber = null;
    this.answer = null;
    this.operator = null;
    this.question = null;
  }

  init(minimumNumber, maximumNumber){
    let mathUtility = new MathUtility(minimumNumber, maximumNumber);
    this.firstNumber = mathUtility.generateRandomNumber();
    this.secondNumber = mathUtility.generateRandomNumber();
    let operator = this.selectRandomOperator(mathUtility.getOperators());
    this.operator = operator.sign;
    this.answer = operator.method(this.firstNumber, this.secondNumber);
    while(this.answer === NaN){
      this.secondNumber = mathUtility.generateRandomNumber();      
      this.answer = operator.method(this.firstNumber, this.secondNumber);
    }
    this.question = this.createQuestion();
  }

  selectRandomOperator(operators) {
    return operators[Math.floor(Math.random() * operators.length)];
  }

  createQuestion(){
    return `${this.firstNumber} ${this.operator} ${this.secondNumber}`
  }
}

class Timer {

  constructor(time, timerElement) {
    this.time = time;
    this.$timer = timerElement;
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

  constructor(data) {
    this.score = 0;
    this.questionAnswers = []
    this.$questionElement = data.$questionElement;
    this.$userAnswerElement = data.$userAnswerElement;
    this.$scoreElement = data.$scoreElement;
    this.timer = null;
    this.$nextButton = data.$nextButton;
    this.numberOfQuestions = data.numberOfQuestions;
    this.minimumNumber = data.minimumNumber;
    this.maximumNumber = data.maximumNumber;
    this.$timerElement = data.$timerTarget;
    this.timerLimit = data.timerLimit;
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
        this.timer = this.resetTime();
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
    let question = new Question();
    question.init(this.minimumNumber, this.maximumNumber);
    return question;
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

  resetTime(){
    return new Timer(this.timerLimit, this.$timerElement).startTime(this.$nextButton);
  }

  displayAnswers(){
    let unanswerWrong = this.filterAnswers();
    let answersOfWrong = unanswerWrong.map((entity) => {return `${entity.question} --> ${entity.answer}`}).join('<br>');
    this.$questionElement.html(answersOfWrong);
    this.$userAnswerElement.remove();
    this.$questionElement.height('260px')
  }

  filterAnswers(){
    return this.questionAnswers.filter(obj => {
      return obj.userAnswer === typeOfAnswers.unanswered || obj.userAnswer === typeOfAnswers.wrong
    });
  }
}

$(() => {
  let data = {
    numberOfQuestions : 20,
    minimumNumber : 0,
    maximumNumber : 20,
    $questionElement: $('#qtn'),
    $userAnswerElement : $('#answerdiv'),
    $scoreElement : $('#scoreValue'),
    $nextButton : $('#start'),
    $timerTarget : $('#timeremain'),
    timerLimit : 10,
  }

  new Quiz(data).startQuiz();
});
