import React from 'react'

import Modal from 'src/modules/Modal/Modal'
import ModalHeader from 'src/modules/Modal/ModalHeader'
import ModalContent from 'src/modules/Modal/ModalContent'
import ModalActions from 'src/modules/Modal/ModalActions'
import ModalDescription from 'src/modules/Modal/ModalDescription'
import Portal from 'src/addons/Portal/Portal'

import { assertNodeContains, assertBodyContains, domEvent, sandbox } from 'test/utils'
import * as common from 'test/specs/commonTests'

// ----------------------------------------
// Wrapper
// ----------------------------------------
let wrapper

// we need to unmount the modal after every test to remove it from the document
// wrap the render methods to update a global wrapper that is unmounted after each test
const wrapperMount = (...args) => (wrapper = mount(...args))
const wrapperShallow = (...args) => (wrapper = shallow(...args))

const assertBodyClasses = (...rest) => {
  const hasClasses = typeof rest[rest.length - 1] === 'boolean' ? rest.pop() : true

  rest.forEach(className => {
    const didFind = document.body.classList.contains(className)
    const message = [
      `document.body ${didFind ? 'has' : 'does not have'} class "${className}".`,
      `It has class="${document.body.classList}"`,
    ].join(' ')

    didFind.should.equal(hasClasses, message)
  })
}

describe('Modal', () => {
  beforeEach(() => {
    wrapper = undefined
    document.body.innerHTML = ''
  })

  afterEach(() => {
    if (wrapper && wrapper.unmount) wrapper.unmount()
  })

  common.hasSubComponents(Modal, [ModalHeader, ModalContent, ModalActions, ModalDescription])

  // Heads up!
  //
  // Our commonTests do not currently handle wrapped components.
  // Nor do they handle components rendered to the body with Portal.
  // The Modal is wrapped in a Portal, so we manually test a few things here.

  it('renders a Portal', () => {
    wrapperShallow(<Modal open />)
      .type()
      .should.equal(Portal)
  })

  it('renders to the document body', () => {
    wrapperMount(<Modal open />)
    assertBodyContains('.ui.modal')
  })

  it('renders child text', () => {
    wrapperMount(<Modal open>child text</Modal>)

    document.querySelector('.ui.modal')
      .innerText
      .should.equal('child text')
  })

  it('renders child components', () => {
    const child = <div data-child />
    wrapperMount(<Modal open>{child}</Modal>)

    document
      .querySelector('.ui.modal')
      .querySelector('[data-child]')
      .should.not.equal(null, 'Modal did not render the child component.')
  })

  describe('open', () => {
    it('is not open by default', () => {
      wrapperMount(<Modal />)
      assertBodyContains('.ui.modal.open', false)
    })

    it('is passed to Portal open', () => {
      shallow(<Modal open />)
        .find('Portal')
        .should.have.prop('open', true)

      shallow(<Modal open={false} />)
        .find('Portal')
        .should.have.prop('open', false)
    })

    it('is not passed to Modal', () => {
      shallow(<Modal open />)
        .find('Portal')
        .children()
        .should.not.have.prop('open')

      shallow(<Modal open={false} />)
        .find('Portal')
        .children()
        .should.not.have.prop('open')
    })

    it('does not show the modal when false', () => {
      wrapperMount(<Modal open={false} />)
      assertBodyContains('.ui.modal', false)
    })

    it('does not show the dimmer when false', () => {
      wrapperMount(<Modal open={false} />)
      assertBodyContains('.ui.dimmer', false)
    })

    it('shows the dimmer when true', () => {
      wrapperMount(<Modal open dimmer />)
      assertBodyContains('.ui.dimmer')
    })

    it('shows the modal when true', () => {
      wrapperMount(<Modal open />)
      assertBodyContains('.ui.modal')
    })

    it('shows the modal and dimmer on changing from false to true', () => {
      wrapperMount(<Modal open={false} />)
      assertBodyContains('.ui.modal', false)
      assertBodyContains('.ui.dimmer', false)

      wrapper.setProps({ open: true })

      assertBodyContains('.ui.modal')
      assertBodyContains('.ui.dimmer')
    })

    it('hides the modal and dimmer on changing from true to false', () => {
      wrapperMount(<Modal open />)
      assertBodyContains('.ui.modal')
      assertBodyContains('.ui.dimmer')

      wrapper.setProps({ open: false })

      assertBodyContains('.ui.modal', false)
      assertBodyContains('.ui.dimmer', false)
    })
  })

  describe('basic', () => {
    it('adds basic to the modal className', () => {
      wrapperMount(<Modal basic open />)
      assertBodyContains('.ui.basic.modal')
    })
  })

  describe('size', () => {
    it('defines prop options in _meta', () => {
      Modal._meta.props.should.have.any.keys('size')
      Modal._meta.props.size.should.be.an('array')
    })

    it('adds the size to the modal className', () => {
      Modal._meta.props.size.forEach(size => {
        wrapperMount(<Modal size={size} open />)
        assertBodyContains(`.ui.${size}.modal`)
      })
    })
  })

  describe('dimmer', () => {
    describe('defaults', () => {
      it('is set to true by default', () => {
        Modal.defaultProps.dimmer
          .should.equal(true)
      })

      it('is present by default', () => {
        wrapperMount(<Modal open />)
        assertBodyContains('.ui.dimmer')
      })
    })

    describe('true', () => {
      it('adds classes "dimmable dimmed" to the body', () => {
        wrapperMount(<Modal open dimmer />)
        assertBodyClasses('dimmable', 'dimmed')
      })

      it('adds a dimmer to the body', () => {
        wrapperMount(<Modal open dimmer />)
        assertBodyContains('.ui.page.modals.dimmer.transition.visible.active')
      })
    })

    describe('false', () => {
      it('does not render a dimmer', () => {
        wrapperMount(<Modal open dimmer={false} />)
        assertBodyClasses('dimmable', 'dimmed', 'blurring', false)
      })

      it('does not add any dimmer classes to the body', () => {
        wrapperMount(<Modal open dimmer={false} />)
        assertBodyClasses('dimmable', 'dimmed', 'blurring', false)
      })
    })

    describe('blurring', () => {
      it('adds class "dimmable dimmed blurring" to the body', () => {
        wrapperMount(<Modal open dimmer='blurring' />)
        assertBodyClasses('dimmable', 'dimmed', 'blurring')
      })

      it('adds a dimmer to the body', () => {
        wrapperMount(<Modal open dimmer='blurring' />)
        assertBodyContains('.ui.page.modals.dimmer.transition.visible.active')
      })
    })

    describe('inverted', () => {
      it('adds class "dimmable dimmed" to the body', () => {
        wrapperMount(<Modal open dimmer='inverted' />)
        assertBodyClasses('dimmable', 'dimmed')
        assertBodyClasses('inverted', false)
      })

      it('adds an inverted dimmer to the body', () => {
        wrapperMount(<Modal open dimmer='inverted' />)
        assertBodyContains('.ui.inverted.page.modals.dimmer.transition.visible.active')
      })
    })
  })

  describe('onOpen', () => {
    it('is called on trigger click', () => {
      const spy = sandbox.spy()
      wrapperMount(<Modal onOpen={spy} trigger={<div id='trigger' />} />)

      wrapper.find('#trigger').simulate('click')
      spy.should.have.been.calledOnce()
    })

    it('is not called on body click', () => {
      const spy = sandbox.spy()
      wrapperMount(<Modal onOpen={spy} />)

      domEvent.click('body')
      spy.should.not.have.been.called()
    })
  })

  describe('onClose', () => {
    let spy

    beforeEach(() => {
      spy = sandbox.spy()
    })

    it('is called on dimmer click', () => {
      wrapperMount(<Modal onClose={spy} defaultOpen />)

      domEvent.click('.ui.dimmer')
      spy.should.have.been.calledOnce()
    })

    it('is called on click outside of the modal', () => {
      wrapperMount(<Modal onClose={spy} defaultOpen />)

      domEvent.click(document.querySelector('.ui.modal').parentNode)
      spy.should.have.been.calledOnce()
    })

    it('is not called on click inside of the modal', () => {
      wrapperMount(<Modal onClose={spy} defaultOpen />)

      domEvent.click(document.querySelector('.ui.modal'))
      spy.should.not.have.been.called()
    })

    it('is not called on body click', () => {
      wrapperMount(<Modal onClose={spy} defaultOpen />)

      domEvent.click('body')
      spy.should.not.have.been.calledOnce()
    })

    it('is called when pressing escape', () => {
      wrapperMount(<Modal onClose={spy} defaultOpen />)

      domEvent.keyDown(document, { key: 'Escape' })
      spy.should.have.been.calledOnce()
    })

    it('is not called when the open prop changes to false', () => {
      wrapperMount(<Modal onClose={spy} defaultOpen />)

      wrapper.setProps({ open: false })
      spy.should.not.have.been.called()
    })

    it('is not called when open changes to false programmatically', () => {
      wrapperMount(<Modal onClose={spy} defaultOpen />)

      wrapper.setProps({ open: false })
      spy.should.not.have.been.called()
    })

    it('is not called on dimmer click when closeOnDimmerClick is false', () => {
      wrapperMount(<Modal onClose={spy} defaultOpen closeOnDimmerClick={false} />)

      domEvent.click('.ui.dimmer')
      spy.should.not.have.been.called()
    })

    it('is not called on body click when closeOnDocumentClick is false', () => {
      wrapperMount(<Modal onClose={spy} defaultOpen closeOnDocumentClick={false} />)

      domEvent.click(document.body)
      spy.should.not.have.been.called()
    })
  })

  describe('closeOnEscape', () => {
    it('closes the modal when Escape is pressed by default', () => {
      wrapperMount(<Modal defaultOpen closeOnEscape />)

      document.body.childElementCount.should.equal(1)
      domEvent.keyDown(document, { key: 'Escape' })
      document.body.childElementCount.should.equal(0)
    })

    it('closes the modal when true and Escape is pressed', () => {
      wrapperMount(<Modal defaultOpen closeOnEscape />)

      document.body.childElementCount.should.equal(1)
      domEvent.keyDown(document, { key: 'Escape' })
      document.body.childElementCount.should.equal(0)
    })

    it('does not close the modal when false and Escape is pressed', () => {
      wrapperMount(<Modal defaultOpen closeOnEscape={false} />)

      document.body.childElementCount.should.equal(1)
      domEvent.keyDown(document, { key: 'Escape' })
      document.body.childElementCount.should.equal(1)
    })
  })

  describe('closeOnDocumentClick', () => {
    it('is false by default', () => {
      Modal.defaultProps.closeOnDocumentClick.should.equal(false)
    })
    it('closes the modal on document click when true', () => {
      wrapperMount(<Modal defaultOpen closeOnDocumentClick />)

      document.body.childElementCount.should.equal(1)
      domEvent.click(document.body)
      document.body.childElementCount.should.equal(0)
    })
    it('does not close the modal on document click when false', () => {
      wrapperMount(<Modal defaultOpen closeOnDocumentClick={false} />)

      document.body.childElementCount.should.equal(1)
      domEvent.click(document.body)
      document.body.childElementCount.should.equal(1)
    })
  })

  describe('mountNode', () => {
    it('render modal within mountNode', () => {
      const mountNode = document.createElement('div')
      document.body.appendChild(mountNode)

      wrapperMount(<Modal mountNode={mountNode} open>foo</Modal>)
      assertNodeContains(mountNode, '.ui.modal')
    })
  })

  describe('closeIcon', () => {
    it('is not present by default', () => {
      wrapperMount(<Modal open>foo</Modal>)
      assertBodyContains('.ui.modal .icon', false)
    })

    it('defaults to `close` when boolean', () => {
      wrapperMount(<Modal open closeIcon>foo</Modal>)
      assertBodyContains('.ui.modal .icon.close')
    })

    it('is present when passed', () => {
      wrapperMount(<Modal open closeIcon='bullseye'>foo</Modal>)
      assertBodyContains('.ui.modal .icon.bullseye')
    })

    it('triggers onClose when clicked', () => {
      const spy = sandbox.spy()

      wrapperMount(<Modal onClose={spy} open closeIcon='bullseye'>foo</Modal>)
      domEvent.click('.ui.modal .icon.bullseye')
      spy.should.have.been.calledOnce()
    })
  })

  describe('scrolling', () => {
    afterEach(() => {
      document.body.classList.remove('scrolling')
    })

    it('does not add the scrolling class to the body by default', () => {
      wrapperMount(<Modal open />)
      assertBodyClasses('scrolling', false)
    })

    it('adds the scrolling class to the body when taller than the window', (done) => {
      wrapperMount(<Modal open>foo</Modal>)

      window.innerHeight = 10

      requestAnimationFrame(() => {
        assertBodyClasses('scrolling')
        done()
      })
    })

    it('removes the scrolling class from the body when the window grows taller', (done) => {
      assertBodyClasses('scrolling', false)

      wrapperMount(<Modal open>foo</Modal>)
      window.innerHeight = 10

      requestAnimationFrame(() => {
        assertBodyClasses('scrolling')
        window.innerHeight = 10000

        requestAnimationFrame(() => {
          assertBodyClasses('scrolling', false)
          done()
        })
      })
    })
  })
})
