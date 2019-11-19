var MathUtility = {

  generateRandomNumber : function(minimumNumber, maximumNumber) {
    return Math.floor((Math.random() * maximumNumber) + minimumNumber);
  },

  getOperators :function(integerType){
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
      method: function(a,b){ return parseInt(a / b, integerType); }
    }];
  }
}

class Question {

  constructor(integerType) {
    this.firstNumber = null;
    this.secondNumber = null;
    this.answer = null;
    this.operator = null;
    this.question = null;
    this.integerType = integerType;
  }

  init(minimumNumber, maximumNumber){
    this.firstNumber = MathUtility.generateRandomNumber(minimumNumber, maximumNumber);
    this.secondNumber = MathUtility.generateRandomNumber(minimumNumber, maximumNumber);
    let operator = this.selectRandomOperator(MathUtility.getOperators(this.integerType));
    this.operator = operator.sign;
    this.answer = operator.method(this.firstNumber, this.secondNumber);
    while(isNaN(this.answer)){
      this.secondNumber = MathUtility.generateRandomNumber();
      this.answer = operator.method(this.firstNumber, this.secondNumber);
    }
    this.question = this.questionStatement();
  }

  selectRandomOperator(operators) {
    return operators[Math.floor(Math.random() * operators.length)];
  }

  questionStatement(){
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
    this.integerType = data.integerType;
    this.typeOfAnswers = Object.freeze({
      unanswered : 0,
      wrong : 0,
      correct : 1,
    });
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
        this.displayAnswers();
      }
    });
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
    let question = new Question(this.integerType);
    question.init(this.minimumNumber, this.maximumNumber);
    return question;
  }

  calculateScore(questionNumber){
    this.score += this.evaluateQuestion(questionNumber);
    this.displayScore();
  }

  evaluateQuestion(questionNumber){
    let userAnswer = parseInt(this.$userAnswerElement.val(), this.integerType);
    let questionAnswer = this.questionAnswers[questionNumber];
    if(userAnswer === ''){
      questionAnswer.userAnswer = this.typeOfAnswers.unanswered;
      return this.typeOfAnswers.unanswered;
    } else {
      if(userAnswer === questionAnswer.answer){
        questionAnswer.userAnswer = this.typeOfAnswers.correct;
        return this.typeOfAnswers.correct;
      }
      else {
        questionAnswer.userAnswer = this.typeOfAnswers.wrong;
        return this.typeOfAnswers.wrong;
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
    this.$questionElement.nextAll().remove();
    this.$questionElement.height('75%')
  }

  filterAnswers(){
    return this.questionAnswers.filter(obj => {
      return obj.userAnswer === this.typeOfAnswers.unanswered || obj.userAnswer === this.typeOfAnswers.wrong
    });
  }
}

$(() => {
  let data1 = {
    numberOfQuestions : 20,
    minimumNumber : 0,
    maximumNumber : 20,
    $questionElement: $('#qtn'),
    $userAnswerElement : $('#answerdiv'),
    $scoreElement : $('#scoreValue'),
    $nextButton : $('#start'),
    $timerTarget : $('#timeremain'),
    timerLimit : 10,
    integerType : 10,
  }
  let data2 = {
    numberOfQuestions : 20,
    minimumNumber : 0,
    maximumNumber : 20,
    $questionElement: $('#qtn2'),
    $userAnswerElement : $('#answerdiv2'),
    $scoreElement : $('#scoreValue2'),
    $nextButton : $('#start2'),
    $timerTarget : $('#timeremain2'),
    timerLimit : 10,
    integerType : 10,
  }

  new Quiz(data1).startQuiz();
  new Quiz(data2).startQuiz();
});
