import React, { useEffect, useState } from 'react';
import './App.css';
import Select from '@atlaskit/select';
import Button from 'react-bootstrap/Button';

function App() {
  const [menus, setMenus] = useState<string[]>([]);
  const [pageData, setPageData] = useState({ title: '', paragraphs: [] });
  const [randomize, setRandomize] = useState<{ id: number; menu: string }[]>([]);
  const [answer, setAnswer] = useState<string | undefined>();
  const [fade, setFade] = useState(false);
  const [scale, setScale] = useState(false);
  const [slide, setSlide] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [displayedAnswer, setDisplayedAnswer] = useState<string>('');
  const [jackpotAnimation, setJackpotAnimation] = useState(false);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
      if (tabs.length === 0 || !tabs[0].id) {
        console.error("No active tab found.");
        return;
      }

      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: extractHtmlData
        },
        (results: any) => {
          if (chrome.runtime.lastError) {
            console.error("Script injection failed: ", chrome.runtime.lastError);
            return;
          }

          if (results && results[0].result) {
            console.log(results[0].result);
            setPageData(results[0].result);
            setMenus(results[0].result.menu);
          }
        }
      );
    });
  }, []);

  const extractHtmlData = () => {
    const pageTitle = document.title;
    const allParagraphs = Array.from(document.querySelectorAll('p')).map(p => p.innerText);
    const menu = Array.from(document.querySelectorAll('h5.pb-2.text-lg.font-medium.leading-tight.text-blue-400'))
      .map(element => element.textContent);
    return { title: pageTitle, paragraphs: allParagraphs, menu: menu };
  };

  const menuOprions = () => {
    return menus.map(menu => ({
      label: menu,
      value: menu
    }));
  };

  const handleSelectionChange = (selectedOptions: any) => {
    console.log(selectedOptions);
    setRandomize(selectedOptions.map((menu: any, index: number) => ({
      id: index,
      menu: menu.value // Store the value of the menu
    })));
  };

  // const randomPick = () => {
  //   if (randomize.length === 0) return;
  //   for(var i=0; i< 10; i++) {
  //     const randomIndex = Math.floor(Math.random() * randomize.length);
  //     setAnswer(randomize[randomIndex].menu);
  //     setBounce(true);
  //     setTimeout(() => setBounce(false), 500); // Reset bounce after animation
  //   }
  //   // const randomIndex = Math.floor(Math.random() * randomize.length);

  //   // setAnswer(randomize[randomIndex].menu);

  //   // setScale(false); // Reset scale
  //   // setTimeout(() => setScale(true), 0); // Trigger scale-up

  //   // setTimeout(() => setFade(true), 0); // Trigger fade-in
  //   // setFade(false); // Reset fade

  //   // setSlide(false); // Reset slide
  //   // setTimeout(() => setSlide(true), 0); // Trigger slide-in

  //   // setBounce(true);
  //   // setTimeout(() => setBounce(false), 500); // Reset bounce after animation

  // };

  const randomPick = () => {
    if (randomize.length === 0) return;
    const correctIndex = Math.floor(Math.random() * randomize.length);
    const correctAnswer = randomize[correctIndex].menu;

    setJackpotAnimation(true);
    let falseAnswers = [...randomize];

    // Simulate rolling effect
    const interval = setInterval(() => {
      if (falseAnswers.length === 0) {
        clearInterval(interval);
        setTimeout(() => {
          setDisplayedAnswer(correctAnswer);
          setJackpotAnimation(false);
        }, 300); // Delay before showing the correct answer
      } else {
        const randomFalseIndex = Math.floor(Math.random() * falseAnswers.length);
        setDisplayedAnswer(falseAnswers[randomFalseIndex].menu);
        falseAnswers.splice(randomFalseIndex, 1); // Remove shown answer
      }
    }, 300); // Change the answer every 300ms
  };

  return (
    <div className="App">
      <h3>Canteen Random Meal Picker</h3>

      <Select
        inputId="single-select-example"
        className="single-select"
        classNamePrefix="react-select"
        options={menuOprions()}
        placeholder="Choose menus"
        isMulti
        isSearchable={true}
        onChange={handleSelectionChange} // Pass function reference
      />
      <br />
      <Button as="input" type="button" value="Randomize" onClick={randomPick} />
      <br />
      {/* <div className={`fade-in ${fade ? 'fade-in-active' : ''}`}>
        {answer && <p>Selected Menu: {answer}</p>}
      </div>

      <div className={`scale-up ${scale ? 'scale-up-active' : ''}`}>
        {answer && <p>Selected Menu: {answer}</p>}
      </div>

      <div className={`slide-in ${slide ? 'slide-in-active' : ''}`}>
        {answer && <p>Selected Menu: {answer}</p>}
      </div>

      <div className={bounce ? 'bounce-in' : ''}>
        {answer && <p>Selected Menu: {answer}</p>}
      </div> */}

      <div className="answer-container">
        <div className={`jackpot ${jackpotAnimation ? 'jackpot-animation' : ''}`}>
          <p className={`answer ${jackpotAnimation ? 'fade-in' : ''}`}>{displayedAnswer}</p>
        </div>
      </div>

    </div>
  );
}

export default App;
