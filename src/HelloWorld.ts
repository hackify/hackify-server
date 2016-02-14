import {Component} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';

@Component({
    selector: 'hello-world',
    template: `<input placeholder="Type hello world !" (keyup)="hello(input.value)" #input>{{message}}`
})
export class HelloWorld {

    private message = "";

    hello(value) {
        this.message = value;
    }

}

bootstrap(HelloWorld, []);